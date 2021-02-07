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

As a default, minikube uses the [docker driver](https://minikube.sigs.k8s.io/docs/drivers/docker) to run
a single docker container named _minikube_. In this container another
[docker daemon](https://docs.docker.com/get-started/overview/#docker-architecture)
is started that in turn runs all the Kubernetes components in addition
to the docker containers making up the actual application.
The advantage of this container _inception_ is that the outer container encapsulates the setup
of the Kubernetes cluster while the inner containers represent a realistic execution environment.
It should be noted that minikube is not meant to be used in a production environment.

## Required installations
While minikube provides the cluster infrastructure a command line tool called
[kubectl](https://kubernetes.io/docs/reference/kubectl/overview/)
is used to manage Kubernetes itself.
Please follow the instructions on
[minikube installation](https://kubernetes.io/docs/setup/minikube) and
[kubectl installation](https://kubernetes.io/docs/tasks/tools/install-kubectl), respectively.
In addition to installing these executables it is also helpful to install
[kubectl shell autocompletion](https://kubernetes.io/docs/tasks/tools/install-kubectl/#enabling-shell-autocompletion).

## Starting the cluster
After the installations are finished, use the following commands to create a _minikube_ profile
and to start the cluster. Per default minikube uses a host-only network. While this is secure it
inhibits the usage of the application from other hosts in the LAN.
Use the following options to start the minikube cluster with the docker driver and to
expose port 80 of the minikube network through port 8080 of the host.
```
$ minikube start --driver=docker --ports=8080:80
```

Note that if the _minikube_ profile did already exist before executing this command
the started cluster may not be configured with the given options.
On Linux minikube profiles are located in the folder `~/.minikube/profiles`.
In order to validate that the profile is configured correctly run the following command
and validate the output:
```
$ minikube profile list -ojson | jq -r '.valid[0].Config | .Driver, .ExposedPorts[0]'
docker
8080:80
```

As a next step, start the web-based Kubernetes user interface with the following command:
```
$ minikube dashboard
```

As mentioned above, a docker daemon  is running inside the _minikube_ docker container.
All Kubernetes components and containerized services
that are supposed to run in the cluster are located in its registry.
In this playground the
[docker build](https://docs.docker.com/engine/reference/commandline/build/)
command is used to wrap a microservice up into a docker container and store it in a registry.
In order for the docker command to use the registry of the _inner_ docker daemon
modify the environment of the current shell with the following command:
```
$ eval $(minikube -p minikube docker-env)
```
Note that the environment variables can be unset with the following command:
```
$ unset $(minikube -p minikube docker-env | awk -F '[ =]' '/export/ { print $2 }')
```

## Building a dockerized application
The folder [hello-node](hello-node) contains a simple 
[Typescript](https://www.typescriptlang.org/) skeleton application
that returns the text "Hello World" on a http _get_ request on port 8080.
In order to package the application into a docker container make sure you have node.js
installed and run the following commands:
```
$ cd hello-node
$ npm run dockerbuild
```
Running the command `docker images` should now show the _hello-node_ container image alongside
several kubernetes containers:
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

## Kubernetes components relevant to start an application
The following definition list points out the relevant Kubernetes components to run this playground.
Note that they are all visible in the Kubernetes dashboard.
<dl>
  <dt><a href="https://kubernetes.io/docs/concepts/architecture/nodes">Node</a></dt>
  <dd>The physical worker machine that runs containerized applications.
      In this playground the only node is the local machine that runs minikube.</dd>
  <dt><a href="https://kubernetes.io/docs/concepts/workloads/pods">Pod</a></dt>
  <dd>Representation of a group of one or more co-located and co-scheduled containers in the K8s cluster.
      In terms of Docker concepts, a Pod is similar to a group of Docker containers
      with shared namespaces and shared filesystem volumes.
      A Pod is the smallest unit that is managed by Kubernetes.</dd>
  <dt><a href="https://kubernetes.io/docs/concepts/workloads/controllers/replicaset">ReplicaSet</a></dt>
  <dd>Description of a group of identical Pods to increase resilience.
      A ReplicaSet ensures that a specified number of Pod replicas are running at any given time.</dd>
  <dt><a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment">Deployment</a></dt>
  <dd>Description of a <i>desired state</i> of Pods and ReplicaSets.
      The Deployment defines the container image(s) to be used,
      and the IP port that exposes the service.
      It can also be used to describe the ReplicaSet.</dd>
  <dt><a href="https://kubernetes.io/docs/concepts/services-networking/service">Service</a></dt>
  <dd>Description of a network service consisting of a set of Pods.
      The service forwards traffic to a set of Pods through its IP address and port.
      Depending on its configuration the traffic is distributed with a round robin or random strategy.
      In a cloud environment the service can also provision a load balancer for the service.</dd>
  <dt><a href="https://kubernetes.io/docs/concepts/services-networking/ingress">Ingress</a></dt>
  <dd>Description of exposed HTTP or HTTPS routes from outside the cluster to Services within the cluster.
      An Ingress may provide load balancing, SSL termination and name-based virtual hosting.
      The Ingress is fulfilled by an Ingress Controller that needs to be configured separately.
      Relevant ingress controllers include
      <a href="https://github.com/kubernetes-sigs/aws-load-balancer-controller#readme">AWS</a>,
      <a href="https://github.com/kubernetes/ingress-gce/blob/master/README.md#readme">GCE</a> and 
      <a href="https://github.com/kubernetes/ingress-nginx/blob/master/README.md#readme">nginx</a>.</dd>
</dl>

## Starting the application
The file [deployments.yml](deployments.yml) defines the _Deployment_
including the _ReplicaSet_ of the application.
In order to start the associated _Pods_ run the following command:
```
$ kubectl apply -f deployments.yml
deployment.apps/hello-node-deployment created
```
Note that the _Deployment_ can be deleted by running:
```
$ kubectl delete -f deployments.yml
deployment.apps "hello-node-deployment" deleted
```
As a next steps the running pods need to be combined into a Service that
makes them reachable under an IP address:
```
$ kubectl apply -f services.yml
service/hello-node-service created
```
In order to expose the Service to the outside of the cluster an Ingress Controller,
and an Ingress resource are needed.
First enable an NGINX Ingress Controller in minikube (this may take a minute):
```
$ minikube addons enable ingress
🔎  Verifying ingress addon...
🌟  The 'ingress' addon is enabled
```
Next verify that the NGINX Ingress Controller is running:
```
$ kubectl get pods -n kube-system
NAME                                        READY   STATUS      RESTARTS   AGE
...
ingress-nginx-controller-558664778f-5j8j2   1/1     Running     0          4h47m
...
```

Now start the Ingress by running:
```
$ kubectl apply -f ingresses.yml
ingress.networking.k8s.io/hello-node-ingress created
```

It should now be possible to do a http query on the Ingress and receive the _Hello World_ response:
```
curl $(minikube ip)
Hello World
```

Note, that the IP address used in this statement is not accessible from other hosts on the LAN.
However, since minikube has been started with a port forwarding the same response should be returned
with the command:
```
$ curl http://localhost:8080
Hello World
```
