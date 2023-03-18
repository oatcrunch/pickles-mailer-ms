@ECHO OFF
ECHO Deploying kuberketes resources (make sure you have Docker and Kubernetes installed and that Docker Desktop is running).
call kubectl create namespace mailer
call kubectl apply -f ../modules/mailer-service/k8s 