# Welcome to Pickles Mailer

This is a simple POC project to demonstrate highly available emailing microservice backend application. This project is developed mainly using Typescript as the primary language and it leverages on ExpressJS as the library to run backend service. There are scripts written to automate deployment into AWS cloud (AWS CDK library that generates cloud formation template and also eksctl client library to create Kubernetes cluster on AWS).  

## High Level Architecture

TODO

## Pre-requisites

Tools to be installed on your machine:
- **[NodeJS](https://nodejs.org/en)**
- **[Docker & Kubernetes](https://www.docker.com/products/docker-desktop/)**
- **[AWS CLI](https://aws.amazon.com/cli/)**
- **[eksctl](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html)**

Admin AWS account set up (mainly for deployment and creating delegate account):
1. Make sure you have an AWS user account set up and configured with administrative privilege (check this out: https://dev.to/aws-builders/creating-your-first-iam-admin-user-and-user-group-in-your-aws-account-machine-learning-part-1-3cne).
2. Refer to this video, https://www.youtube.com/watch?v=Rp-A84oh4G8 to configure your local machine so that your machine has the privilege for cloud infra deployment later on.

Delegate AWS account set up (for S3 uploads and also invoking Event Bridge from an application):
1. 

Google email account set up:
1. We will use Gmail API to send email (there are other options, but for consistency, we will just use Gmail).

Get permission Google email account user to use it to send emails: 
1. 

## Set Up Instructions
-   `npm run build` compile typescript to js
-   `npm run watch` watch for changes and compile
-   `npm run test` perform the jest unit tests
-   `cdk deploy` deploy this stack to your default AWS account/region
-   `cdk diff` compare deployed stack with current state
-   `cdk synth` emits the synthesized CloudFormation template
