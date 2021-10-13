**Notes**

This does require some knowledge of web dev and javascript to setup correctly so if u dont understand the basics please go and learn first


This isnt a perfect system so please do not rely just on this source, there are many ways you could abuse it such as
[*] Scripts in names
[*] Very long names
[*] Phishing links in names
[*] No rate limits (this could lead to getting rate limited by mongo)

**Setup**

__Database__
You wil need a mongo database to be able to use this. [If you dont have one watch this video up to 3:48 to see how to set one up](https://www.youtube.com/watch?v=-Wf8E6RRuXA)

__Captcha__

[Go to this website](https://www.google.com/recaptcha/admin/create)

Type in anything for the website label

Then for the captcha type click on reCAPTCHA v2 then "I'm not a robot" tickbox

For the domain type in your website domain (if you are using this on your machine, just put in localhost)

Then accept the tos and click submit

This should then show 2 keys, with the "Secret Key" go into the .env file and place it next to CAPTCHA_SECRET=

so it should look like: CAPTCHA_SECRET=yourkeyhere

Then with the "Site Key" go into the "signup.html" and on line 18 you should see a string that says "your key here"

Replace the contents inside of it with your key

__Filling in the rest of our env file__

MONGO_URI=mongo connection string here
CAPTCHA_SECRET=captcha secret here
DOMAIN=website domain here (just put localhost if you are running this on ur machine)
SESSION_SECRET=just spam ur keyboard with random letters and numbers

__Starting Up__

Not to forget you will need to install the packages by running this command in the console: npm i

Remove the ".example" file extention from the .env file, after you do that it should just be .env

Then run this: node server.js

Then go to http://localhost:3000/signup and enjoy :)

Feel free to expand off this, this is just the basics of a signup system :)

**Other Stuff**

http://localhost:3000/signup - signup page
http://localhost:3000/login - login page
http://localhost:3000/profile - profile page (only works when logged in)
http://localhost:3000/logout - logs you out of the current account
