#!/bin/bash
echo "Deploying kubernetes resources (make sure you have Docker and Kubernetes installed and that Docker Desktop is running)."
kubectl create namespace mailer
kubectl apply -f ../modules/mailer-service/k8s