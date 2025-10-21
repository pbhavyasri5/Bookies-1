# Use OpenJDK 17 slim image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy the JAR file from target directory
COPY target/bookies-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8090 (Spring Boot default)
EXPOSE 8090

# Set Java options for better container performance
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
