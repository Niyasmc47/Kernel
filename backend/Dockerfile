# Multi-stage Docker build for KERNEL Backend (Spring Boot 3 + Java 21)
# Stage 1: Build JAR using Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build executable fat JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal, secure JRE runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add non-root user for production security
RUN addgroup -S kernelgroup && adduser -S kerneluser -G kernelgroup
USER kerneluser

# Copy built JAR from builder stage
COPY --from=builder /app/target/kernel-backend-1.0.0.jar app.jar

# Expose standard port (Azure App Service maps PORT to 80 or 8080)
EXPOSE 8080

# Configure memory limits optimized for Azure Free/B1 tier
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

# Launch Spring Boot Application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

