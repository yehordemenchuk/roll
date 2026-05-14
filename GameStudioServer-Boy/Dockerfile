# Build (obmedzená pamäť JVM — na slabom serveri inak javac „visí“ / swapuje)
FROM maven:3.9.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
ENV MAVEN_OPTS="-Xmx768m -XX:MaxMetaspaceSize=256m -XX:+UseG1GC"
COPY pom.xml .
COPY src ./src
RUN mvn -B --no-transfer-progress -DskipTests package

# Run
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=build /app/target/*.jar app.jar
USER spring:spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
