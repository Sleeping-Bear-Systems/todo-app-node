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
            post {
                always {
                    deleteDir()
                }
            }
        }
    }
}
