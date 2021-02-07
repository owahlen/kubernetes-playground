# Kubernetes Playground

A practical introduction to Kubernetes using a playground environment

## Introduction
From the [kubernetes.io](https://kubernetes.io) webpage:

> Kubernetes, also known as K8s, is an open-source system for automating deployment, scaling, and management of containerized applications.

Kubernetes shines for [microservice architectures](https://en.wikipedia.org/wiki/Microservices)
where an application is broken down into small services that  communicate with each other through web APIs. 
Each of these services is wrapped up in a self-contained virtualization container that can run on a server machine
without many requirements on its environment. Kubernetes is the orchestration system for these containers
and makes sure that the overall application is resilient and performant.

[Setting up Kubernetes](https://kubernetes.io/docs/setup/production-environment/tools)
on a bare metal machine is work intense.
For a playground environment it is more easy to set it up on a local machine using minikube.
From the [minikube](https://minikube.sigs.k8s.io) webpage:

> minikube quickly sets up a local Kubernetes cluster on macOS, Linux, and Windows.

As a default minikube uses the [docker driver](https://minikube.sigs.k8s.io/docs/drivers/docker) to run
a single container named _minikube_. In this container another docker daemon is started that
in turn runs all the Kubernetes components, and the containerized services mentioned above.
The advantage of this container _inception_ is that the outer container encapsulates the setup of the Kubernetes
setup while the inner containers represent a realistic execution environment.
It should be noted that minikube is not meant to be used in a production environment.

## Required installations
While minikube provides the cluster infrastructure the
[kubectl](https://kubernetes.io/docs/reference/kubectl/overview/)
command line tool is used to manage Kubernetes itself.
Please follow the instructions on
[minikube installation](https://kubernetes.io/docs/setup/minikube) and
[kubectl installation](https://kubernetes.io/docs/tasks/tools/install-kubectl), respectively.
In addition to installing these executables it is also helpful to install
[kubectl shell autocompletion](https://kubernetes.io/docs/tasks/tools/install-kubectl/#enabling-shell-autocompletion).

## Starting the cluster
After the installations are finished, use the following commands to create a _minikube_ profile
and to start the cluster. The options ensure that the minikube cluster is started
with the docker driver and port 80 of the minikube network is exposed to the host on port 8080.
```
minikube start --driver=docker --ports=8080:80
```

Note that if the _minikube_ profile did already exist before executing this command
the started cluster may not be configured with the given options.
On Linux minikube profiles are located in the folder `~/.minikube/profiles`.
In order to validate that the profile is configured correctly run the following command:
```
minikube profile list -ojson | jq -r '.valid[0].Config | .Driver, .ExposedPorts[0]'
```
It should return the output
```
docker
8080:80
```

As a next step enable the web-based Kubernetes user interface with the following command:
```
minikube dashboard
```

As mentioned above a [docker daemon](https://docs.docker.com/get-started/overview/#docker-architecture)
is running inside of the _minikube_ docker container. All Kubernetes components and containerized services
that are supposed to run in the cluster are located in its registry.
In this playground the
[docker build](https://docs.docker.com/engine/reference/commandline/build/)
command is used to wrap a micro service up into a docker container and store it in a registry.
In order for the docker command to use the registry of the _inner_ docker daemon
modify the environment of the current shell with the following command:
```
eval $(minikube -p minikube docker-env)
```
Note that the environment variables can be unset with the following command:
```
unset $(minikube -p minikube docker-env | awk -F '[ =]' '/export/ { print $2 }')
```


## Building a dockerized application
The folder [hello-node](hello-node) contains a simple 
[Typescript](https://www.typescriptlang.org/) skeleton application
that returns the text "Hello World" on a http _get_ request on port 8080.
In order to package the application into a docker container make sure you have node.js
installed and run the following commands:
```
cd hello-node
npm run dockerbuild
```
Running the command `docker images` should now show the _hello-node_ container image along
side several kubernetes containers:
```
REPOSITORY                                              TAG                 IMAGE ID            CREATED             SIZE
hello-node                                              latest              6699706c4507        3 hours ago         1.02GB
node                                                    14                  2c6a7b16a92d        41 hours ago        943MB
k8s.gcr.io/kube-proxy                                   v1.20.2             43154ddb57a8        3 weeks ago         118MB
k8s.gcr.io/kube-apiserver                               v1.20.2             a8c2fdb8bf76        3 weeks ago         122MB
k8s.gcr.io/kube-controller-manager                      v1.20.2             a27166429d98        3 weeks ago         116MB
k8s.gcr.io/kube-scheduler                               v1.20.2             ed2c44fbdd78        3 weeks ago         46.4MB
kubernetesui/dashboard                                  v2.1.0              9a07b5b4bfac        8 weeks ago         226MB
gcr.io/k8s-minikube/storage-provisioner                 v4                  85069258b98a        2 months ago        29.7MB
us.gcr.io/k8s-artifacts-prod/ingress-nginx/controller   v0.40.2             4b26fa2d90ae        4 months ago        286MB
k8s.gcr.io/etcd                                         3.4.13-0            0369cf4303ff        5 months ago        253MB
jettech/kube-webhook-certgen                            v1.3.0              4d4f44df9f90        6 months ago        54.7MB
jettech/kube-webhook-certgen                            v1.2.2              5693ebf5622a        7 months ago        49MB
k8s.gcr.io/coredns                                      1.7.0               bfe3a36ebd25        7 months ago        45.2MB
kubernetesui/metrics-scraper                            v1.0.4              86262685d9ab        10 months ago       36.9MB
k8s.gcr.io/pause                                        3.2                 80d28bedfe5d        11 months ago       683kB

```

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
