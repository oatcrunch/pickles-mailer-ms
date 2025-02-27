# Welcome to Pickles Mailer

This is a simple POC project to demonstrate highly available emailing microservice backend application. This project is developed mainly using Typescript as the primary language and it leverages on ExpressJS as the library to run backend service. There are scripts written to automate deployment into AWS cloud (AWS CDK library that generates cloud formation (Infrastructure as a Code or IaaS) template and also eksctl client library to create Kubernetes cluster on AWS). No need to manually create them using the AWS Console.

## Issues and Considerations

What this design/solution considers:

-   High availability
-   Extensibility
-   Auto-scalability
-   Resiliency
-   Portability
-   Cost
-   Features:
    -   Send email to single or multiple recipients
    -   Ability to attach files
    -   Error handling
    -   Auto-retries
    -   Audit trail (storing in database)
    -   Persistence of attachments in server
    -   Supports HTML

## High Level Architecture

[![Main components](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/Pickle+Mailer+High+Level+Architecture.drawio.png)](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/Pickle+Mailer+High+Level+Architecture.drawio.png)
_Figure 1: Main components_

[![AWS Solutions Architecture Diagram](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/AWS+Solutions+Architecture+Diagram.drawio.png)](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/AWS+Solutions+Architecture+Diagram.drawio.png)
_Figure 2: AWS Solutions Architecture Diagram_

## Pre-requisites

### Tools to be installed on your machine:

-   **[NodeJS](https://nodejs.org/en)** (version `18.14.0` preferred)
-   **[Docker & Kubernetes](https://www.docker.com/products/docker-desktop/)**
-   **[AWS CLI](https://aws.amazon.com/cli/)** (version > `2.9` preferred)
-   **[eksctl](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html)**
-   **[AWS CDK](https://aws.amazon.com/cdk/)** (optional)
-   Windows OS (preferred) or Linux (Ubuntu)

### Admin AWS account set up (mainly for deployment and creating delegate account):

1. Make sure you have an AWS user account set up and configured with administrative privilege. Refer **[this video](https://dev.to/aws-builders/creating-your-first-iam-admin-user-and-user-group-in-your-aws-account-machine-learning-part-1-3cne)** for more details.
2. Refer to **[this video](https://www.youtube.com/watch?v=Rp-A84oh4G8)**, to configure your local machine so that your machine has the privilege for cloud infra deployment later on.
3. Upon successful account creation, and for the sake of this POC, just set the default region name of the admin account to `ap-southeast-1` for consistency by running `aws configure` command on your terminal. 
4. Press enter twice to skip AWS Access Key ID and AWS Secret Access Key.
5. When prompted for `Default Region Name`, enter `ap-southeast-1` and press enter twice again to complete set up. Refer snapshot below for example:
[![Configure AWS Default Region Name](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/aws+configure+default+env.PNG)](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/aws+configure+default+env.PNG)

### Delegate AWS account set up (for S3 uploads and also invoking Event Bridge from an application):

1. Create IAM policies for S3 `PutObject` and EventBridge `PutEvents`. Refer to **[creating IAM policies video](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/Creating+IAM+policies+for+S3+and+Event+Bridge.mp4)**.
2. Attach created IAM policies to a new delegate user and save the `Access Key` and `Secret Access Key` somewhere which will be used later. Refer **[this video](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/Attaching+IAM+policies+to+delegate+user.mp4)** for more info.

### Google email account set up:

1. We will use Gmail API to send email (there are other options, but for consistency, we will just use Gmail).

### Get permission Google email account user to use it to send emails:

1. Check the first half of **[this video](https://www.youtube.com/watch?v=-rcRf7yswfM)** on steps of how to get permission from a Google mail account to send email using libraries like Nodemailer.
2. Please take note on the `Client ID`, `Client Secret`, and `Refresh Token` and save them somewhere for reference later.

## Pre-run: Cloning Project and Installing Dependencies

1. Run `git clone git@github.com:oatcrunch/pickles-mailer-ms.git` or manually download the zipped version of the project to any desired location on your local machine.
2. Open the cloned project using your favourite IDE like Visual Studio Code.
3. Open up a terminal at your project root directory and run `npm install` (it will install node packages in the root as well as in the subdirectory at modules/mailer-service).
4. Open up `Docker Desktop` and when it is up (with Docker running), then run `npm run bootstrap` next to install CDK Toolkit into your AWS account (note that this step is only needed to do once).

## Running on DEVELOPMENT mode

### Prepare environment variable

1. Save `Access Key`, `Secret Access Key`, `Client ID`, `Client Secret`, and `Refresh Token` in a `.env` file under `./modules/mailer-service` relative to project root directory (make them in the form of `key=value` pairs).
2. Also, save your Gmail email address that you used to set up for sending email in the same file.
3. Your file should like like: [![.env content format](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/dotenv.PNG)](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/dotenv.PNG).
4. Do take note on the `keys` in the example. The keys you have in your own .env must match with the ones in the sample above.

### Deploy cloud infra using AWS CDK through command line

1. Run `Docker Desktop` and ensure that both Docker and Kubernetes indicators on the bottom left of the application UI shows green.
2. Run `npm run deploy` to create cloud formation stack on AWS which then creates the require cloud infra later on ie Lambda, EventBridge, SQS, DynamoDB and S3.
3. Note that after completed testing, do run `npm run destroy` to destroy the created stack on AWS to prevent additional costs from incurring (you still need Docker and Kubernetes to be running for this).

### Running the ExpressJS backend locally

1. Navigate to "./modules/mailer-service" by running `cd ./modules/mailer-service` from project root, run `npm run build-start` to trigger build and then start the application.
2. Optionally, you can split into 2 consecutive commands ie. `npm run build` and `npm run start` in lieu of the previous step.

## Running on PRODUCTION Mode (for Linux machine, you may wish to run the corresponding .sh files instead)

1. Replace `./modules/mailer-service/mailer.secret.yaml`'s `replace_with_base64_encoded_string` string with the corresponding `base64 encoded` string of the values you stored in your .env file earlier (you can use this online **[tool](https://www.base64encode.org/)**). It should look like the following:
   [![sample of mailter.secret.yaml](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/secrets+yaml.PNG)](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/secrets+yaml.PNG)
2. Run `Docker Desktop` and ensure that both Docker and Kubernetes indicators on the bottom left of the application UI shows green.
3. `cd` to `scripts` directory on terminal and run `create-cluster.bat` to create AWS cluster with a set of nodes of certain specs within a given region.
4. While operation on step 1 is still running, open another terminal and on the same directory as step 1, run `deploy-persistence-stack.bat`. Once it prompts you to proceed with deployment, type `y` and press enter.
5. Once step 1 has completed (practise patience as the operations may take 30 minutes or even more for deployment), run `deploy-k8s.bat` on any of the terminal to deploy Kubernetes resources into the newly created cluster from step 1.
6. Note that if any of the operation above failed for some reason, feel free to re-run the .bat file as it should not have any impact on the final outcome. Also, the error thrown related to the ingress-nginx-controller will not affect the system (ignore it for now).
7. After completed testing, please run `destroy-cluster.bat` and also `destroy-persistence-stack.bat` (press `y` and enter when prompted) to wipe out all resources created on cloud. Take note that these 2 operations can be executed concurrently on separate terminals (do make sure that Docker Desktop with Docker and Kubernetes enabled is still running).

## Pre-test Preparations

### JSON body (mandatory)

1. The body of `'Content-Type': 'application/json'` to include:
-   `to`: to indicate recipients' email address (comma separated if more than 1).
-   `subject`: to indicate the title of the email.
-   `text`: contains the main body of the email.
2. For example:
```
{
    "to": "pickles-test@outlook.com",
    "subject": "Hi from autosender",
    "text": "I am sending this because I want to test my email API."
}
```
3. The JSON itself should be the value for the key `json` when POST-ing the `/email` endpoint.

### File attachments (optional)

1. Each file attachment is the value for the key `file` when POST-ing `/email` endpoint.
2. Any file format is supported.

### Sample Javascript code to test the endpoint

```
var port = 3000;
var host = "http://localhost";
var request = require("request");
var fs = require("fs");
var options = {
  method: "POST",
  url: `${host}:${port}/email`,
  headers: {
    "Content-Type": "application/json",
  },
  formData: {
    file: [
      {
        value: fs.createReadStream("./files/Picture1.png"),
        options: {
          filename: "./files/Picture1.png",
          contentType: null,
        },
      },
      {
        value: fs.createReadStream("./files/some random text file.txt"),
        options: {
          filename: "./files/some random text file.txt",
          contentType: null,
        },
      },
    ],
    json: '{\n    "to": "pickles-test@outlook.com",\n    "subject": "Hi from autosender",\n    "text": "I am sending this because I want to test my email API."\n}',
  },
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});
```
Note: NPM package for `request` is needed for the above JS code to work. Please modify the port, host, JSON content and also the file path(s) if any.

## Testing the Application

1. If you are running on DEVELOPMENT mode, your URL should be http://localhost:3000.
2. If you are running on PRODUCTION mode, your URL should be the AWS load balancer service's URL (running `kubectl get svc -n mailer` command and grab the `EXTERNAL-IP` field, make sure you use the right port which is `8081`). For example: `afa0e894c77bf41a5b2e8cd464acba25-1793325236.ap-southeast-1.elb.amazonaws.com:8081`.
3. The relative resource path of which we will be testing be `HTTP POST '/email'` with the body payload illustrated below.

Click on below image icon to view the demo video on how to run the test:
[![Running on PRODUCTION mode demo](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/Demo+prod+preview.PNG)](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/pickles+emal+api+demo.mp4)

Alternatively, you can also open up Swagger doc by appending `/api-docs` at the base URL on your browser for testing:
[![Testing using Swagger](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/Swagger+Demo+Video+Snapshot.PNG)](https://mel-public-bucket.s3.ap-southeast-1.amazonaws.com/How+to+use+Swagger+doc+to+invoke+Email+API+endpoint.mp4)

## Running Unit Tests

1. Open up `Docker Desktop` and make sure Docker engine is running (indicator showing green).
2. At project root directory, run `npm run test` and it will run unit tests using Jest library for the entire project.

## Troubleshooting

1. This guide is primarily written based on `Windows OS`. If you run on Linux (Ubuntu), you need to make sure that the `*.sh` files in `scripts` folder are given the executable permission. You need to run `chmod +x <filename>.sh` before executing the file in scripts directory (IMPORTANT: the steps written in this guide are not thoroughly tested on Ubuntu).
2. The version of NodeJS used for this POC is `18.14.0`. For consistency, it is recommended to use this version.
3. If any of the script (.sh or .bat) files cannot run successfully, consider break them down by manually running each command line on the terminal instead. For example in `deploy-k8s.sh`, run `kubectl create namespace mailer` followed by `kubectl apply -f ../modules/mailer-service/k8s` separately.
4. Occasionally, connection to Docker might timeout/fail during deployment, feel free to retry running the script again.
5. If there are issues with `npm run deploy`, update your AWS CLI to the latest version (for Linux, tested on v2.11.6).

## Discussion and Assumptions Made

1. This proof of concept is based on assumption that the cloud SMTP mail server is highly available, but without much info on the performance metric.
2. There is some limitation on the API used to send email because it will not tell which user(s) from a given set of email addresses as recipients is/are not getting the email.
3. Based on the above point, we ONLY know if the delivery fails if ALL of the recipients are not getting the email at all.
4. The event payload that AWS lambda is able to accept is limited. Hence, we cannot use it to handle email with large file attachments (dockerized application can better handle this).
5. The event hub can be substituted with tools like Apache Kafka. However, take note that this requires more management on the resources needed, hence extra time and cost involved.
6. It is possible to have a queue fronting the load balancer. However, in this design it is not used as I believe that the load balanced dockerized applications are able to handle that (again just an assumption made as no thorough tests are being done).
7. For point above, the queue (AWS Event Bridge, Apache Kafka, Rabbit MQ etc) should be able to reduce the load to the core application, but it would cause performance issue ie longer time to receive email and to get data persisted.
