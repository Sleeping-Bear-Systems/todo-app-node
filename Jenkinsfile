pipeline {
    agent none
    stages {
        stage('Build & Test') {
            agent {
                docker {
                    image 'node:26'
                }
            }
            steps {
                script {
                    sh 'npm ci'
                    sh 'npm run build'
                    sh 'npm run biome:ci'
                    sh 'npm run test'
                }
            }
        }
        stage('Playwright E2E') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.60.0-jammy'
                }
            }
            steps {
                script {
                    sh 'npm ci'
                    sh 'npm run playwright:test'
                }
            }
        }
    }
}
