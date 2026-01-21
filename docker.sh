#!/bin/bash

# Village Manager Docker Helper Script
# This script provides easy commands to manage the Docker environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        if ! docker compose version &> /dev/null; then
            print_error "docker-compose is not installed."
            exit 1
        else
            DOCKER_COMPOSE="docker compose"
        fi
    else
        DOCKER_COMPOSE="docker-compose"
    fi
}

# Main commands
case "${1:-help}" in
    "start"|"up")
        print_header "Starting Village Manager"
        check_docker
        check_docker_compose
        $DOCKER_COMPOSE up -d
        print_status "Services started successfully!"
        echo ""
        echo "🌐 Available services:"
        echo "  • Backend API: http://localhost:3000"
        echo "  • PostgreSQL: localhost:5432"
        echo "  • Redis: localhost:6379"
        echo ""
        echo "📊 Optional services (use profiles):"
        echo "  • BullMQ Dashboard: ./docker.sh monitoring"
        echo "  • PgAdmin: ./docker.sh admin"
        ;;

    "stop"|"down")
        print_header "Stopping Village Manager"
        check_docker
        check_docker_compose
        $DOCKER_COMPOSE down
        print_status "All services stopped."
        ;;

    "restart")
        print_header "Restarting Village Manager"
        check_docker
        check_docker_compose
        $DOCKER_COMPOSE restart
        print_status "Services restarted successfully!"
        ;;

    "logs")
        print_header "Showing logs"
        check_docker
        check_docker_compose
        $DOCKER_COMPOSE logs -f ${2:-backend}
        ;;

    "seed")
        print_header "Seeding Database"
        check_docker
        check_docker_compose
        $DOCKER_COMPOSE --profile seeder up --remove-orphans seeder
        print_status "Database seeded successfully!"
        ;;

    "reset")
        print_header "Resetting Database and Volumes"
        check_docker
        check_docker_compose
        print_warning "This will delete ALL data including database and Redis data!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            $DOCKER_COMPOSE down -v
            $DOCKER_COMPOSE up -d
            print_status "Database reset successfully!"
        else
            print_status "Operation cancelled."
        fi
        ;;

    "monitoring")
        print_header "Starting BullMQ Dashboard"
        check_docker
        check_docker_compose
        $DOCKER_COMPOSE --profile monitoring up -d bullmq-dashboard
        print_status "BullMQ Dashboard started: http://localhost:3001"
        ;;

    "admin")
        print_header "Starting PgAdmin"
        check_docker
        check_docker_compose
        $DOCKER_COMPOSE --profile admin up -d pgadmin
        print_status "PgAdmin started: http://localhost:5050"
        echo "  • Email: admin@villagemanager.com"
        echo "  • Password: admin123"
        echo ""
        echo "📝 Database connection details:"
        echo "  • Host: postgres"
        echo "  • Port: 5432"
        echo "  • Database: village_manager"
        echo "  • Username: admin"
        echo "  • Password: password123"
        ;;

    "status")
        print_header "Service Status"
        check_docker
        $DOCKER_COMPOSE ps
        ;;

    "build")
        print_header "Building Docker Images"
        check_docker
        check_docker_compose
        $DOCKER_COMPOSE build --no-cache
        print_status "Images built successfully!"
        ;;

    "clean")
        print_header "Cleaning Docker Resources"
        check_docker
        check_docker_compose
        print_warning "This will remove all containers, images, and volumes!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            $DOCKER_COMPOSE down -v --rmi all
            docker system prune -f
            print_status "Docker resources cleaned successfully!"
        else
            print_status "Operation cancelled."
        fi
        ;;

    "dev")
        print_header "Starting Development Environment"
        check_docker
        check_docker_compose
        $DOCKER_COMPOSE --profile monitoring --profile admin up -d
        print_status "Development environment started!"
        echo ""
        echo "🌐 All services available:"
        echo "  • Backend API: http://localhost:3000"
        echo "  • BullMQ Dashboard: http://localhost:3001"
        echo "  • PgAdmin: http://localhost:5050"
        ;;

    "help"|*)
        print_header "Village Manager Docker Helper"
        echo ""
        echo "Usage: ./docker.sh [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  start, up      - Start all core services (postgres, redis, backend)"
        echo "  stop, down     - Stop all services"
        echo "  restart        - Restart all services"
        echo "  logs [service] - Show logs (default: backend)"
        echo "  seed          - Run database seeder"
        echo "  reset         - Reset database and volumes (DESTRUCTIVE!)"
        echo "  monitoring     - Start BullMQ dashboard"
        echo "  admin         - Start PgAdmin"
        echo "  status        - Show service status"
        echo "  build         - Rebuild Docker images"
        echo "  clean         - Clean all Docker resources (DESTRUCTIVE!)"
        echo "  dev           - Start development environment with monitoring tools"
        echo "  help          - Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./docker.sh start"
        echo "  ./docker.sh logs backend"
        echo "  ./docker.sh seed"
        echo "  ./docker.sh dev"
        echo ""
        echo "🔧 First time setup:"
        echo "  1. ./docker.sh build"
        echo "  2. ./docker.sh start"
        echo "  3. ./docker.sh seed"
        echo ""
        echo "🌐 Access points:"
        echo "  • Backend API: http://localhost:3000"
        echo "  • PostgreSQL: localhost:5432"
        echo "  • Redis: localhost:6379"
        echo "  • BullMQ Dashboard: http://localhost:3001 (when monitoring profile is active)"
        echo "  • PgAdmin: http://localhost:5050 (when admin profile is active)"
        ;;
esac
