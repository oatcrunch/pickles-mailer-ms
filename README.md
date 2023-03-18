# Welcome to Pickles Mailer

This is a simple POC project to demonstrate highly available emailing microservice backend application. This project is developed mainly using Typescript as the primary language and it leverages on ExpressJS as the library to run backend service. There are scripts written to automate deployment into AWS cloud (AWS CDK library that generates cloud formation template and also eksctl client library to create Kubernetes cluster on AWS).  


## Issues and Considerations

What this design/solution considers:
- High availability
- Extensibility
- Auto-scalability
- Resiliency
- Portability
- Cost
- Features:
    - Send email to single or multiple recipients
    - Ability to attach files
    - Error handling
    - Auto-retries
    - Audit trail (storing in database)
    - Persistence of attachments in server
    - Supports HTML


## High Level Architecture

TODO


## Pre-requisites

### Tools to be installed on your machine:
- **[NodeJS](https://nodejs.org/en)**
- **[Docker & Kubernetes](https://www.docker.com/products/docker-desktop/)**
- **[AWS CLI](https://aws.amazon.com/cli/)**
- **[eksctl](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html)**
- **[AWS CDK](https://aws.amazon.com/cdk/)** (optional)

### Admin AWS account set up (mainly for deployment and creating delegate account):
1. Make sure you have an AWS user account set up and configured with administrative privilege. Refer **[this video](https://dev.to/aws-builders/creating-your-first-iam-admin-user-and-user-group-in-your-aws-account-machine-learning-part-1-3cne)** for more details.
2. Refer to **[this video](https://www.youtube.com/watch?v=Rp-A84oh4G8)**, to configure your local machine so that your machine has the privilege for cloud infra deployment later on.

### Delegate AWS account set up (for S3 uploads and also invoking Event Bridge from an application):
1. Create IAM policies for S3 `PutObject` and EventBridge `PutEvents`. Refer to **[creating IAM policies video](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/Creating+IAM+policies+for+S3+and+Event+Bridge.mp4)**.
2. Attach created IAM policies to a new delegate user and save the `Access Key` and `Secret Access Key` somewhere which will be used later. Refer **[this video](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/Attaching+IAM+policies+to+delegate+user.mp4)** for more info.

### Google email account set up:
1. We will use Gmail API to send email (there are other options, but for consistency, we will just use Gmail).

### Get permission Google email account user to use it to send emails: 
1. Check the first half of **[this video](https://www.youtube.com/watch?v=-rcRf7yswfM)** on steps of how to get permission from a Google mail account to send email using libraries like Nodemailer.
2. Please take note on the `Client ID`, `Client Secret`, and `Refresh Token` and save them somewhere for reference later.

## Running on DEVELOPMENT mode

### Prepare environment variable
1. Save `Access Key`, `Secret Access Key`, `Client ID`, `Client Secret`, and `Refresh Token` in a `.env` file under  `./modules/mailer-service` relative to project root directory (make them in the form of `key=value` pairs).
2. Also, save your Gmail email address that you used to set up for sending email in the same file.
3. Your file should like like: [![.env content format](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/dotenv.PNG)](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/dotenv.PNG).
4. Do take note on the `keys` in the example. The keys you have in your own .env must match with the ones in the sample above. 

### Deploy cloud infra using AWS CDK through command line
1. On project root, run `npm install` (it will install node packages in the root as well as in the subdirectory at modules/mailer-service).
1. Run `npm run deploy` to create cloud formation stack on AWS which then creates the require cloud infra later on ie Lambda, EventBridge, SQS, DynamoDB and S3.

### Running the ExpressJS backend locally

1. While still on project root, run `npm run build-start` to trigger build and then start the application.
2. Optionally, you can split into 2 consecutive commands ie. `npm run build` and `npm run start` in lieu of the previous step.


## Running on PRODUCTION mode

1. Run `Docker Desktop` and ensure that both Docker and Kubernetes indicators on the bottom left of the application UI shows green.
2. `cd` to `scripts` directory on terminal and run `create-cluster.bat` to create AWS cluster with a set of nodes of certain specs within a given region.
3. While operation on step 1 is still running, open another terminal and on the same directory as step 1, run `deploy-persistence-stack.bat`. Once it prompts you to proceed with deployment, type `y` and press enter.
4. Once step 1 has completed (practise patience as the operations may take up to 30 minutes for deployment), run `deploy-k8s.bat` on any of the terminal to deploy Kubernetes resources into the newly created cluster from step 1.
5. Note that if any of the operation above failed for some reason, feel free to re-run the .bat file as it should not have any impact on the final outcome. Also, the error thrown related to the ingress-nginx-controller will not affect the system (ignore it for now).
[![Running on PRODUCTION mode demo](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/POST+to+email+endpoint+prod+mode.mp4)](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/POST+to+email+endpoint+prod+mode.mp4)

Click on below image icon to view the demo video:
[![Running on PRODUCTION mode demo](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/Demo+prod+preview.PNG)](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/POST+to+email+endpoint+prod+mode.mp4)

## Testing the application

1. If you are running on DEVELOPMENT mode, your URL should be http://localhost:3000.
2. If you are running on PRODUCTION mode, your URL should be the AWS load balancer service's URL.
3. The endpoint of which we will be testing be `HTTP POST '/email'` with the body payload illustrated below.

## Potential Improvements

TODO


## Set Up Instructions
-   `npm run build` compile typescript to js
-   `npm run watch` watch for changes and compile
-   `npm run test` perform the jest unit tests
-   `cdk deploy` deploy this stack to your default AWS account/region
-   `cdk diff` compare deployed stack with current state
-   `cdk synth` emits the synthesized CloudFormation template
