# --- Stage 1: build the jar with Maven ---
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# --- Stage 2: run the jar on a slim JRE, not the full JDK/Maven image ---
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

RUN addgroup -S candor && adduser -S candor -G candor
USER candor

COPY --from=build /app/target/candor-backend-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
