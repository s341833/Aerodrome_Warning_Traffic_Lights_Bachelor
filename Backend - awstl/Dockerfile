FROM maven:3.8.4-jdk-11 as maven

#RUN mkdir /root/m2

WORKDIR /usr/src/app
COPY . /usr/src/app
RUN --mount=type=cache,target=/root/.m2  mvn clean package -Dmaven.test.skip


FROM openjdk:11-jre-slim

RUN useradd --create-home -s /bin/bash user
WORKDIR /home/user
USER user

COPY --from=maven /usr/src/app/target/awtl.jar /home/user/awtl.jar
ENTRYPOINT ["java", "-jar", "/home/user/awtl.jar"]

#FROM tomcat:9.0.58-jre11-openjdk-slim-buster
#WORKDIR /usr/local/tomcat/webapps/
#RUN rm -rf /usr/local/tomcat/webapps/*
#COPY --from=maven /usr/src/app/target/awtl.war /usr/local/tomcat/webapps/ROOT.war

#ENTRYPOINT ["catalina.sh", "run"]
