# Configuration Overview
Documents the necessary configurations per environment.

## Overview of Variables in Use

| Variable                                                                 | Purpose                                                                                           |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `SSO_CLIENT_ID`, `SSO_TENANT_ID`, `SSO_CLIENT_SECRET`                    | Azure authentication with next-auth                                                               |
| `NEXTAUTH_SECRET`                                                        | Secret used to encrypt service side sessions managed by next-auth                                 |
| `SSO_CUSTOM_SCOPE`                                                       | Assign correct AD scope on Auth-callback                                                          |
| `NEXTAUTH_URL`                                                           | Redirect URL after authentication (e.g., `http://localhost:3000/dashboard` for local development) |
| `NODE_TLS_REJECT_UNAUTHORIZED`                                           | Certificate verification control (see note below)                                                 |
| `NEXT_PUBLIC_GATEWAY_URL`                                                | URL to backend service                                                                            |
| `NEXT_PUBLIC_STAGE`                                                      | Current environment (e.g. 'qa', 'dev')                                                            |
| `NEXT_PUBLIC_DEBUG_MODE=true`                                            | Enables debugging features like clicking through WorkflowItems and showing extra flags            |
| `NEXT_PUBLIC_DEBUG_ROLE_OVERRIDE='FN_TEILNEHMERINNEN_ANLEGEN,...'`       | Override roles for development                                                                    |

## Local
Create a `.env.local` file and configure the values as follows:

### `SSO_CLIENT_ID` and `SSO_CLIENT_ID`
These values can be found by navigating to the `Azure App Registration` called `iBOS NG - SquerIO` created for the local development and test environment.

You can copy the values `Application (client) ID` and `Directory (tenant) ID` from the App Registration's `Overview` page to use as values for `SSO_CLIENT_ID` and `SSO_CLIENT_ID` respectively.

### `SSO_CLIENT_SECRET`
Grab this value from the password vault entry that was shared with you or contact a colleague who can share the credentials with you securely.

In case the credentials got lost, new ones have to be created by navigating to `Manage > Certificates & secrets` at the test environment's App Registration.

### `NEXTAUTH_SECRET`

Set this to a random string of your choice. This value is used for encrypting sessions used by NextAuth.

### `NEXTAUTH_URL`
For local development set this to `http://localhost:3000`. Change the port in case you configured to run the development server at a different port on your machine.

### `SSO_CUSTOM_SCOPE`
Needs to be set to `read.user`. Refers to the API scopes set at the App Registration in the section `Expose an API`.

### `NEXT_PUBLIC_GATEWAY_URL`
Set this to the URL where the backend is reachable. For local development this is usually `http://localhost:8080`.

In case you are using WSL2 to run the frontend, replace `localhost` with the IP configured for the default route when running `ip route` in WSL.

### `NEXT_PUBLIC_STAGE`
Set this to `dev`.

### `NEXT_PUBLIC_DEBUG_MODE`
Set this to `true`.

### `NEXT_PUBLIC_DEBUG_ROLE_OVERRIDE`
Set this to the list of roles you want to use as override for local development or keep empty and use the ones defined in the backend's DB.

## Test

The following values need to be configured as environment variables at the Azure App Service used for testing/qa.

### `SSO_CLIENT_ID` and `SSO_CLIENT_ID`
These values can be found by navigating to the `Azure App Registration` called `iBOS NG - SquerIO` created for the local development and test environment.

You can copy the values `Application (client) ID` and `Directory (tenant) ID` from the App Registration's `Overview` page to use as values for `SSO_CLIENT_ID` and `SSO_CLIENT_ID` respectively.

### `SSO_CLIENT_SECRET`
Grab this value from the password vault entry that was shared with you or contact a colleague who can share the credentials with you securely.

In case the credentials got lost, new ones have to be created by navigating to `Manage > Certificates & secrets` at the test environment's App Registration.

### `NEXTAUTH_SECRET`

Set this to a random string (e.g. 32 byte random generated string using `openssl rand`). This value is used for encrypting sessions used by NextAuth.

### `NEXTAUTH_URL`
This value needs to be set to the public base URL where the frontend is reachable. Example: `https://ibosngfrontendtestapp.azurewebsites.net`

### `SSO_CUSTOM_SCOPE`
Needs to be set to `read.user`. Refers to the API scopes set at the App Registration in the section `Expose an API`.

### `NEXT_PUBLIC_GATEWAY_URL`
Set this to the URL where the backend is reachable.

### `NEXT_PUBLIC_STAGE`
Set this to `qa`.

### `NEXT_PUBLIC_DEBUG_MODE`
Set this to `true`.

### `NEXT_PUBLIC_DEBUG_ROLE_OVERRIDE`
Should be left blank or not even created at the App Service.

## Pre-Prod
...

## Production
...
