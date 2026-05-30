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
                    sh 'npm install'
                    sh 'npm run build'
                    sh 'npm run biome:ci'
                    sh 'npm run test'
                }
            }
        }
        stage('Playwright E2E') {
            agent {
                docker {
                    image 'node:26'
                }
            }
            steps {
                script {
                    sh 'npm install'
                    sh 'npx playwright install --with-deps'
                    sh 'npm run playwright:test'
                }
            }
        }
    }
}
