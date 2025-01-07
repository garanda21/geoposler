
# Geoposler

Is a Dockerized email campaign management application that allows users to create templates, manage contact lists, and send HTML-based emails via SMTP. It includes features to simplify email marketing campaigns and integrates seamlessly with a MySQL database for managing data.

<p align="center">
   <img src="https://github.com/user-attachments/assets/7aec2d16-1d45-4194-9b52-9154f96ec35f" alt="Image 2" width="50%">
  
</p>

<p align="center">
   <img src="https://github.com/user-attachments/assets/15f3c4ab-8056-44cc-83e0-02ecff1609d7" width="40%" style="margin-right: 5px;">   
  
<img src="https://github.com/user-attachments/assets/e77a805b-7292-4e49-987f-0115662335e8"  width="40%"/>

</p>



## Features

- Create and manage email templates.
- Manage contact lists efficiently.
- Send HTML emails using SMTP parameters.
- Seamless MySQL database integration.

---

## Requirements

1. Docker installed on your system.
2. MySQL database connection details:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`

---

## Environment Variables

| Variable       | Description                                | Required |
|----------------|--------------------------------------------|----------|
| `DB_HOST`      | MySQL database hostname or IP address      | Yes      |
| `DB_USER`      | MySQL database username                   | Yes      |
| `DB_PASSWORD`  | MySQL database password                   | Yes      |
| `DB_NAME`      | MySQL database name                       | Yes      |

---

## Running the Application

1. Clone the repository:
   ```bash
   git clone https://github.com/garanda21/geoposler.git
   ```
2. Navigate to the project directory:
   ```bash
   cd geoposler
   ```
3. Set up the `.env` file with the required variables:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=mypassword
   DB_NAME=mycooldb
   ```
4. Start the application with Docker Compose:
   ```bash
   docker-compose up --build
   ```

---

## Docker Compose Example

Below is an example `docker-compose.yml` to set up Geoposler along with a MySQL database:

```yaml
services:
  geoposler:
    image: ghcr.io/garanda21/geoposler:latest
    ports:
      - "3454:80"
    environment:
      - DB_HOST=mysql
      - DB_USER=root
      - DB_PASSWORD=mypassword
      - DB_NAME=mycooldb
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    container_name: mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: mypassword
      MYSQL_DATABASE: mycooldb
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  mysql_data:
```
---
**IMPORTANT NOTICE**:  The `mySQL` database service must be up and in a healthy state before starting the Geoposler service to ensure a successful connection to the database, using docker-compose you should add `depends_on` and `healthcheck` properties.

## Tech Stack

- **Frontend:** Vite, React, Tailwind CSS
- **Backend:** Node.js
- **Database:** MySQL
- **Containerization:** Docker

---

## License

This project is licensed under the [MIT License](LICENCE).

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or fixes.
