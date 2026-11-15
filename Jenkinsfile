pipeline{

    agent {
        label 'ubuntu-docker'
    }

    stages{
        stage('Verify the Ubuntu Agnet'){
            steps{
                echo 'Checking Jenkins Agents...'

                sh '''
                    echo "===== SYSTEM INFORMATION ====="
                    echo "Hostname : "
                    hostname
                    echo "Username : "
                    whoami

                    echo " Current Directory.."
                    pwd 

                    echo "=====JAVA VERSION====="
                    java -version

                    echo "===== DOCKER VERSION======"
                    docker --version
                '''
            }
        }

        stage('Environment Validation'){
            steps{
                 echo 'Validating Ubuntu Agent Environment'

                sh '''
                 echo "===== NODE ====="
                    node --version

                echo "=====NPM====="
                npm --version

                echo "=====DOCKER===="
                docker --version

                echo "=====DOCKER DAEMON ===="
                docker info

                '''
            }
        }
    }

}