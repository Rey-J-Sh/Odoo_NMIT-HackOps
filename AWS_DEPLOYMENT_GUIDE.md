# AWS Deployment Guide for Shiv Accounts Cloud

This guide will help you deploy the Shiv Accounts Cloud application on AWS with PostgreSQL database.

## 🏗️ Architecture Overview

```
Internet → CloudFront → ALB → EC2 (Backend) → RDS PostgreSQL
                    ↓
                S3 (Frontend)
```

## 📋 Prerequisites

- AWS Account
- AWS CLI configured
- Domain name (optional)
- SSL certificate (for production)

## 🗄️ Step 1: Database Setup (RDS PostgreSQL)

### 1.1 Create RDS PostgreSQL Instance

```bash
# Using AWS CLI
aws rds create-db-instance \
    --db-instance-identifier shiv-accounts-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.4 \
    --master-username postgres \
    --master-user-password YourSecurePassword123! \
    --allocated-storage 20 \
    --storage-type gp2 \
    --vpc-security-group-ids sg-xxxxxxxxx \
    --db-subnet-group-name default \
    --backup-retention-period 7 \
    --multi-az \
    --storage-encrypted \
    --deletion-protection
```

### 1.2 Configure Security Group

```bash
# Create security group for RDS
aws ec2 create-security-group \
    --group-name shiv-accounts-rds-sg \
    --description "Security group for Shiv Accounts RDS"

# Allow PostgreSQL access from EC2
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 5432 \
    --source-group sg-xxxxxxxxx
```

### 1.3 Connect and Setup Database

```bash
# Connect to RDS instance
psql -h your-rds-endpoint.region.rds.amazonaws.com -U postgres -d postgres

# Create database
CREATE DATABASE shiv_accounts;

# Run schema
\c shiv_accounts
\i database/schema_updated.sql

# Seed data (optional)
\i database/seed.sql
```

## 🖥️ Step 2: Backend Deployment (EC2)

### 2.1 Create EC2 Instance

```bash
# Launch EC2 instance
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --instance-type t3.micro \
    --key-name your-key-pair \
    --security-group-ids sg-xxxxxxxxx \
    --subnet-id subnet-xxxxxxxxx \
    --associate-public-ip-address \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=shiv-accounts-backend}]'
```

### 2.2 Configure EC2 Instance

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Update system
sudo yum update -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PM2
npm install -g pm2

# Install PostgreSQL client
sudo yum install postgresql15 -y
```

### 2.3 Deploy Backend Code

```bash
# Clone repository
git clone https://github.com/your-username/shiv-accounts.git
cd shiv-accounts/backend

# Install dependencies
npm install --production

# Create environment file
cat > .env << EOF
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=shiv_accounts
DB_USER=postgres
DB_PASSWORD=YourSecurePassword123!
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
EOF

# Start application with PM2
pm2 start src/server.js --name "shiv-accounts-api"
pm2 save
pm2 startup
```

### 2.3 Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo yum install nginx -y

# Configure Nginx
sudo tee /etc/nginx/conf.d/shiv-accounts.conf << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 🌐 Step 3: Frontend Deployment (S3 + CloudFront)

### 3.1 Build Frontend

```bash
# On your local machine
cd shiv-accounts

# Create environment file
echo "NEXT_PUBLIC_API_URL=https://your-domain.com/api" > .env.local

# Build for production
npm run build
```

### 3.2 Deploy to S3

```bash
# Create S3 bucket
aws s3 mb s3://shiv-accounts-frontend

# Upload build files
aws s3 sync out/ s3://shiv-accounts-frontend/ --delete

# Configure bucket for static website
aws s3 website s3://shiv-accounts-frontend --index-document index.html --error-document 404.html
```

### 3.3 Setup CloudFront

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
    --distribution-config '{
        "CallerReference": "shiv-accounts-frontend",
        "Comment": "Shiv Accounts Frontend",
        "DefaultRootObject": "index.html",
        "Origins": {
            "Quantity": 1,
            "Items": [
                {
                    "Id": "S3-shiv-accounts-frontend",
                    "DomainName": "shiv-accounts-frontend.s3.amazonaws.com",
                    "S3OriginConfig": {
                        "OriginAccessIdentity": ""
                    }
                }
            ]
        },
        "DefaultCacheBehavior": {
            "TargetOriginId": "S3-shiv-accounts-frontend",
            "ViewerProtocolPolicy": "redirect-to-https",
            "TrustedSigners": {
                "Enabled": false,
                "Quantity": 0
            },
            "ForwardedValues": {
                "QueryString": false,
                "Cookies": {
                    "Forward": "none"
                }
            }
        },
        "Enabled": true,
        "PriceClass": "PriceClass_100"
    }'
```

## 🔒 Step 4: SSL Certificate (Optional)

### 4.1 Request SSL Certificate

```bash
# Request certificate
aws acm request-certificate \
    --domain-name your-domain.com \
    --validation-method DNS \
    --subject-alternative-names www.your-domain.com
```

### 4.2 Configure HTTPS

```bash
# Update Nginx configuration
sudo tee /etc/nginx/conf.d/shiv-accounts-ssl.conf << EOF
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://\$server_name\$request_uri;
}
EOF
```

## 📊 Step 5: Monitoring and Logging

### 5.1 CloudWatch Setup

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Configure CloudWatch
sudo tee /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << EOF
{
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/home/ec2-user/.pm2/logs/shiv-accounts-api-out.log",
                        "log_group_name": "/aws/ec2/shiv-accounts/backend",
                        "log_stream_name": "{instance_id}"
                    }
                ]
            }
        }
    }
}
EOF

# Start CloudWatch agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
    -s
```

### 5.2 Database Monitoring

```bash
# Enable RDS monitoring
aws rds modify-db-instance \
    --db-instance-identifier shiv-accounts-db \
    --monitoring-interval 60 \
    --monitoring-role-arn arn:aws:iam::your-account:role/rds-monitoring-role
```

## 🔧 Step 6: Backup and Recovery

### 6.1 Database Backup

```bash
# Automated backup (already enabled with RDS)
# Manual backup
pg_dump -h your-rds-endpoint.region.rds.amazonaws.com -U postgres -d shiv_accounts > backup.sql
```

### 6.2 Application Backup

```bash
# Backup application code
tar -czf shiv-accounts-backup.tar.gz /home/ec2-user/shiv-accounts/
aws s3 cp shiv-accounts-backup.tar.gz s3://your-backup-bucket/
```

## 💰 Cost Optimization

### Estimated Monthly Costs (US East)

- **RDS PostgreSQL (db.t3.micro)**: ~$15/month
- **EC2 (t3.micro)**: ~$8/month
- **S3 Storage**: ~$1/month
- **CloudFront**: ~$1/month
- **Total**: ~$25/month

### Cost Optimization Tips

1. Use Reserved Instances for EC2 and RDS
2. Enable S3 Intelligent Tiering
3. Use CloudFront caching
4. Monitor and optimize database queries
5. Set up billing alerts

## 🚨 Security Best Practices

### 1. Network Security
- Use VPC with private subnets
- Configure security groups properly
- Enable VPC Flow Logs

### 2. Database Security
- Use strong passwords
- Enable encryption at rest
- Regular security updates

### 3. Application Security
- Use HTTPS everywhere
- Implement rate limiting
- Regular security audits

## 📈 Scaling Considerations

### Horizontal Scaling
- Use Application Load Balancer
- Multiple EC2 instances
- RDS Read Replicas

### Vertical Scaling
- Upgrade instance types
- Increase RDS storage
- Optimize database queries

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check security groups
   - Verify RDS endpoint
   - Check network connectivity

2. **Application Not Starting**
   - Check PM2 logs
   - Verify environment variables
   - Check Node.js version

3. **Frontend Not Loading**
   - Check S3 bucket policy
   - Verify CloudFront configuration
   - Check CORS settings

### Debug Commands

```bash
# Check PM2 status
pm2 status
pm2 logs shiv-accounts-api

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check database connection
psql -h your-rds-endpoint -U postgres -d shiv_accounts -c "SELECT 1;"
```

## 📝 Maintenance

### Regular Tasks
- Monitor application logs
- Check database performance
- Update security patches
- Backup verification
- Cost optimization review

### Updates
- Test in staging environment
- Use blue-green deployment
- Monitor during updates
- Rollback plan ready

---

This deployment guide provides a production-ready setup for the Shiv Accounts Cloud application on AWS. The architecture is scalable, secure, and cost-effective for small to medium businesses.

