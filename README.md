# Kubernetes Playground

Kubernetes (K8s) is a management system for containerized applications.
In this playground the tool _minikube_ is used to locally run a Kubernetes cluster
and to execute applications packaged in docker containers.

## Setup
Beside the installation of
[minikube](https://kubernetes.io/docs/setup/minikube)
also the tool
[kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl)
is required. Please refer to the linked documentation for setup instructions.
In addition to installing the tools it is also helpful to install
[kubectl shell autocompletion](https://kubernetes.io/docs/tasks/tools/install-kubectl/#enabling-shell-autocompletion).


## Starting the cluster
After the setup is finished use the following commands to start the local cluster
and to get access to the Kubernetes Dashboard. The minikube cluster is started
with the docker driver and port 80 of the minikube network is exposed to the host.
```
minikube start --driver=docker --ports=8080:80
minikube dashboard
```
Minikube comes with a Docker daemon that stores the containers that are supposed
to run in the cluster. In order to redirect all docker commands to
this daemon use the following command:
```
eval $(minikube -p minikube docker-env)
```

## Building a dockerized application
The folder [hello-node](hello-node) contains a simple Typescript application
that returns the text "Hello World" on a http _get_ request on port 8080.
In order to package it up into a docker container make sure you have node.js
installed and run the following commands:
```
cd hello-node
npm run dockerbuild
```
Running the command `docker images` should now show the _hello-node_ image along
side several kubernetes containers.

## Starting the application
The file [deployments.yml](deployments.yml) contains the information on how to
deploy the application to the cluster.
In order to start the application run the following command:
```
kubectl apply -f deployments.yml
```
Note that the application can be deleted by running:
```
kubectl delete -f deployments.yml
```
As a next steps the running pods need to be combined in a service that
makes them reachable under an IP address:
```
kubectl apply -f services.yml
```
In order to expose the service to the outside of the cluster an ingress controller,
and an ingress resource are needed.
First enable an NGINX ingress controller in minikube:
```
minikube addons enable ingress
```
Next verify that the NGINX ingress controller is running (this can take a minute):
```
kubectl get pods -n kube-system
```
Start it by running:
```
kubectl apply -f ingresses.yml
```

## Kubectl cheat sheet
List of all deployments:
```
kubectl get deployments
```
List all replica sets
```
kubectl get rs
```
List all pods including labels
```
kubectl get pods --show-labels
```
## Glossary
<dl>
  <dt>workload</dt>
  <dd>application running on Kubernetes</dd>
  <dt>node</dt>
  <dd>worker machine that runs containerized applications</dd>
  <dt>pod</dt>
  <dd>represents a group of co-located and co-scheduled containers in the cluster</dd>
  <dt>control plane</dt>
  <dd>container orchestration layer that manages nodes and pods</dd>
  <dt>kube-apiserver</dt>
  <dd>control plane component that exposes the Kubernetes API</dd>
  <dt>etcd</dt>
  <dd>control plane component that provides a key value store</dd>
  <dt>kube-scheduler</dt>
  <dd>control plane component that schedules newly created pods to nodes</dd>
  <dt>kube-controller-manager</dt>
  <dd>control plane component that runs controller processes
      (node controller, replication controller, endpoints controller, service account & token controllers)</dd>
  <dt>kubelet</dt>
  <dd>node component that makes sure that containers are running in a pod</dd>
  <dt>kube-proxy</dt>
  <dd>node component that maintains network rules required for communication with pods</dd>
</dl>
