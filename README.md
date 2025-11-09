Note:
	Dont forget to set the admins privs. to read/write to any database.
# initialize npm
	npm init -y
	
# install express
	npm install express

# install mongoose
	npm install mongoose


# Run your connection string in your application
	$mongosh "mongodb+srv://cluster0.l80qzx1.mongodb.net/" --apiVersion 1 --username {MY_USER} --password {MY_PW}


# allow access from anyway / wildcard (0.0.0.0/0) using MongoDB Atlas CLI
	$ brew install mongodb-atlas-cli

# authenticate (CLI auth login code above warning errors)
	$ atlas auth login

# run the access-list command
	$ atlas accessLists create 0.0.0.0/0 --projectId <PROJECT_ID_HERE> --comment "Allow all IPv4"

# remove accessList command
	$ atlas accessLists delete 0.0.0.0/0 --projectId <YOUR_PROJECT_ID> --comment "Remove open‐to‐world rule"

# to get project ID:
	$ atlas projects list

# to get 'mongoURI' connection string (e.g. mongodb+srv://cluster0.l80qzx1.mongodb.net)
	$ atlas clusters describe cluster0 --projectId 680941c99bb0dd72f919b74c \
 	 --output json | jq -r '.connectionStrings.standardSrv'
  
# to get Cluster name:
	$ atlas clusters list --projectId 680941c99bb0dd72f919b74c

# to get user list:
	$ atlas dbusers list --projectId <PROJECT_ID_HERE> --output json

# to grant read/write privs:
	atlas dbusers update {USER} --projectId <PROJECT_ID_HERE> --role readWrite

