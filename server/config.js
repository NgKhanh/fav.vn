Accounts.loginServiceConfiguration.remove({
	service : "facebook"
})

Accounts.loginServiceConfiguration.remove({
	service : "github"
})

Accounts.loginServiceConfiguration.remove({
	service : "google"
})



Accounts.loginServiceConfiguration.insert({
	service : "facebook",
	appId: "338611759532006",
	secret	:"08883488037ebc2491933b3ee3358fa0"
})

Accounts.loginServiceConfiguration.insert({
	service : "google",
	clientId: "459542367640.apps.googleusercontent.com",
	secret	:"hqsR74FwN-WCX1N3pKDTn5IQ"
})

Accounts.loginServiceConfiguration.insert({
	service : "github",
	clientId: "83c0075359ff83617622",
	secret	:"5c64ba97aa0169f0dc7d33c9134ba8808d738315"
})