# LedgerOne

- Online : https://ledgerone.luozihan.space
- Account: admin@example.com
- Password: Admin12345.

A modern cloud-based ERP  system built with ASP.NET Core (.NET 8) and Next.js 14, deployed on AWS (Lambda + API Gateway + Amplify).

This project demonstrates full-stack engineering capability including backend API design, frontend UI architecture, cloud deployment, and DevOps automation.

## Documentation

Detailed documentation is maintained in Notion:

- Software Requirements Specification  
- Architecture Design  
- Development Roadmap  
- Identity & Security Design
- Environment and Branch Strategy : https://www.yuque.com/u21649619/kb/dra7av4g9an1st8q



# scrennshot
<img width="2880" height="1558" alt="image" src="https://github.com/user-attachments/assets/6d1a69e3-e282-4188-ab5a-cfda93b31478" />




<img width="2872" height="2630" alt="image" src="https://github.com/user-attachments/assets/497d1b39-7a83-4e8a-a937-a1df544d487a" />




<img width="2240" height="1006" alt="image" src="https://github.com/user-attachments/assets/8cdc08cb-ddb1-4e16-bfc3-77cf1b752007" />





# Architecture Overview
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/d96302d1-c047-4f21-869a-b451ac145bf0" />



## Tech Stack

### Backend
- ASP.NET Core (.NET 8)
- Minimal APIs
- AWS Lambda
- Amazon API Gateway
- Amazon DynamoDB
- AWS SDK for .NET

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts (Dashboard Charts)
- AWS Amplify Auth (Cognito)

### DevOps 
- AWS Lambda deployment
- API Gateway routing
- Amplify CI/CD
- GitHub version control
- Environment-based configuration

# Features
## Authentication
- AWS Cognito authentication
- Secure session management
- Role-based UI access

## Identity and User Management
- Platform ↔ Cognito user synchronization
  - Create / update / enable-disable / delete users via Cognito Admin APIs
  - User listing backed by Cognito (pagination supported)
  - IAM role-based secure access from Lambda to Cognito


# Project Structure
 ```bash
mini-erp/
│
├── backend/        # ASP.NET Core Lambda project
│
├── frontend/       # Next.js application
│
└── .gitignore
```

# Purpose of This Project
This project was built to nstrate:

- Full-stack development capability
- Cloud-native architecture on AWS
- Serverless backend deployment
- Modern React (Next.js App Router)
- Clean UI architecture with reusable components
- DevOps workflow understanding

# Future Improvements
- Role-based access control(API)
- Order workflow logic
- Inventory alert automation
- CI/CD with GitHub Actions
- Payment integration (Stripe)
- Multi-tenant architecture

# Author
- Zihan Luo
- Full-Stack Developer | Cloud & DevOps Enthusiast
- Adelaide, Australia
