pipeline {
  agent any

  environment {
    FRONTEND_IMAGE = 'garage-mot-frontend'
    BACKEND_IMAGE  = 'garage-mot-backend'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Backend Install') {
      steps { sh 'cd backend && npm install' }
    }

    stage('Frontend Build') {
      steps {
        sh 'cd frontend && npm install'
        sh 'cd frontend && npm run build'
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build -t $BACKEND_IMAGE:$BUILD_NUMBER backend'
        sh 'docker build -t $FRONTEND_IMAGE:$BUILD_NUMBER frontend'
      }
    }
  }
}
