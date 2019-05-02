# FactorialHR SlackApp

This SlackApp allow you to take advantage of [FactorialHR](https://factorialhr.es/) signin.

## Factorial SlackApp Usage
1. /factorial-login here_your_password 
First you must login into factorial account through. (It is assumed that you use same email to access slack as for factorial)
2. /check-in text
This command will start the shift
3. /take-brake text
This command will pause the shift
4. /resume-shift text
This command will resume the shift
5. /check-out text
This command will stop the shift
5. /factorial-help
This is a reminder of existing commands to use this slackApp

## Installation
### Clone Repository
Clone this repository:
`git clone https://github.com/Anexon/factorialSignInSlack.git`
Install all dependencies using npm:
`npm install`

### Create an Heroku app
Register on [Heroku](https://signup.heroku.com/) and create you app where you will upload repository you just have cloned. Heroku will build and run the project so you may have an accesible server that will handle all commands triggered from slack channels.

Install Heroku
`brew install heroku/brew/heroku`(on macOS)
For other OS check this [link](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up)

Login into your Herokue account
`heroku login`

cd to the root cloned repository folder and deploy proyect into heroku using the name you just put when creating Heroku App.
`heroku git:remote -a your_heroku_app_name_here`

Add some space in the code and commit to push into Heroku
`git add .`
`git commit -am "make it better"`
`git push heroku master`

Server is ready to handle slack commands

### Create a SlackApp
Create your first app on slack: [create app](https://api.slack.com/apps?new_app=1)

Navigate to *Oauth & Permissions* section and copy the Oauth Access Token of your app. Paste the token into the *.env* file of the cloned project
`.env
slack_app_token=paste_your_token_here`
