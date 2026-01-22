# Contributing to RDS Status-Site  
- [How to Start](#1-how-to-start)
- [Yarn Command Reference](#2-yarn-command-reference)
- [API Contracts](#3-api-contracts)
- [Setting Up Local System](#4-setting-up-local-system)
- [Prerequisite](#5-prerequisite)
- [Raising a Pull Request](#6-raising-a-pull-request)

##  **1. How to Start**

Read <a href="https://github.com/Real-Dev-Squad/website-welcome/blob/main/CONTRIBUTING.md" target="_blank">this</a>  guide to learn how to clone,fork and raise a PR.
## **2. Yarn Command Reference**  
### Set-up  
`yarn install`

### Development  
To run the project `yarn run dev`.

#### To run the project with Mocked APIs we use [Mock service worker](https://mswjs.io/docs/)
- Configure your development browser to trust `https://localhost` with invalid certificate, follow [this doc](https://mswjs.io/docs/recipes/using-local-https#trust-insecure-localhost)
- Make sure the variable `NEXT_PUBLIC_API_MOCKING` is `ON` in [`.env.development`](https://github.com/Real-Dev-Squad/website-status/blob/develop/.env.development) file
- Replace the `NEXT_PUBLIC_BASE_URL='https://api.realdevsquad.com'` with `NEXT_PUBLIC_BASE_URL='https://localhost'` in [`.env.development`](https://github.com/Real-Dev-Squad/website-status/blob/develop/.env.development) file
- Go to [http://localhost:3000](http://localhost:3000)

You should now be able to see `mocking enabled` in browser console

### Production  
To do a production build `yarn run start`.

## **3. API Contracts**  
API contracts can be found [here](https://github.com/Real-Dev-Squad/website-api-contracts/tree/main/tasks).  

## **4. Setting Up Local System**  
 1. **Get Authenticated cookie**  
    Click <a href="https://github.com/login/oauth/authorize?client_id=c4a84431feaf604e89d1" target="_blank">this</a> link to redirect to authenticating page.
 2. **To get the CORS error resolved follow <a href="https://github.com/Real-Dev-Squad/website-code-docs/tree/main/docs/dev/https-dev-url-cors" target="_blank">this</a> doc**
  
## **5. Prerequisite**
 1. <a href="https://nextjs.org/" target="_blank">Next.js</a>
 3. <a href="https://www.typescriptlang.org/docs/" target="_blank">TypeScript</a>
 4. <a href="https://react-typescript-cheatsheet.netlify.app/docs/basic/setup" target="_blank">React TypeScript cheatsheet</a>

## **6. Raising a Pull Request**
 1. Write tests
 2. Double check the code before every commit/push
 3. Have on-point commit messages
 4. Write useful descriptions and titles
 5. Add comments on your pull request to help guide the reviewer
 6. Make it visual. Add Images or GIFs if needed.
 7. [Link the PR to the issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword) you are working on
 8. [Convert the PR to Draft](https://github.blog/2019-02-14-introducing-draft-pull-requests/) if the work is still in progress
 9. Make sure the checkbox "Allow edits by maintainers" is checked
<img width="345" alt="Screenshot_2022-01-30_at_4 21 19_PM" src="https://user-images.githubusercontent.com/26569942/151747499-38896108-b9b4-4190-a39d-26d61b38d400.png">
