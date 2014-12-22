/***************************************************************************************/
/*
	Description:    This function is used to check if a user has access based on the selected team OR teams
	Parameters:     		teams = one team or array of teams to check
    userid (=OPTIONAL)    	= GUID of the user to check the team membership  against
	Returns:       			true or false
	Calls:          		getUserTeams() and gNullToString(), gIsArray(teams)
	Author:        			Geron Profet (www.crmxpg.nl)
	Note:           		If NO userid is passed the system will use the current user !!!
	
	Reference source: http://crmxpg.nl/wp/2010/05/27/determine-teams-for-any-user-in-javascript/

	Adam Ip																						2013-12-10
	function IsAuthorizedForTeams( teams, userid )
	function AmISoftwareDeveloper()
	
	Adam Ip																						2014-09-30
	function AmISoftwareDeveloper()
	
	Adam Ip																						2014-10-04
	function AmIShowGeneralHidden()
	
*/
var DebugModeTeamsForUser = false;
/* var DebugModeTeamsForUserII = false; */


/***************************************************************************************/
function IsAuthorizedForTeams( teams, userid )
{  
	try
	{
		if( DebugModeTeamsForUser )
			window.alert( "function IsAuthorizedForTeams()" );
		//if only one team is passed (=string) create an array. Else copy teams  array to arrTeams
		if( gIsArray( teams ) == true )
			arrTeams = teams;
		else
		{
			arrTeams = new Array();
			arrTeams[0] = teams;
		}
		
		//get all roles for the user. If no userid is passed, the current user will be used
		userid = gNullToString( userid );
		var xml = getUserTeams( userid );
		if( DebugModeTeamsForUser )
			window.alert( "function IsAuthorizedForTeams()\narrTeams = " + arrTeams + "\nuserid = " + userid + "\nxml = " + xml );
		if( xml != null )
		{
			var xmlNodes = xml.selectNodes( "//BusinessEntity/q1:name" );
			if( xmlNodes != null )
			{
				if( DebugModeTeamsForUser )
					window.alert( "function IsAuthorizedForTeams()\nxmlNodes = " + xmlNodes + "\nxmlNodes.length = " + xmlNodes.length );
				//First loop through all security roles for the user
				for( var i = 0; i < xmlNodes.length; i++ )
				{
					//Now, loop through the requested roles (array)
					for( var j = 0; j < arrTeams.length; j++ ) 
					{
						if( DebugModeTeamsForUser )
							window.alert( "function IsAuthorizedForTeams()\ni = " + i + "\nj = " + j + "\nxmlNodes[i].text = " + xmlNodes[i].text + "\narrTeams[j] = " + arrTeams[j] );
						if( xmlNodes[i].text.toUpperCase() == arrTeams[j].toUpperCase())
						{
							return true;  
							break;
						}
					}
				}            
			}
		}
		return false;
	}
	catch( err )
	{
		window.alert( "function IsAuthorizedForTeams()\nerror code " + err  + "\nerr name = " + err.name + "\nerr message = " + err.message );
	}
}

		
/***************************************************************************************
/*
Description:    This function is used return all security roles for the selected user
Parameters:     userid (optional)    = GUID of the user to check the team against
Returns:        All teams user is a member of
Calls:          gNullToString()
Note:           If no userid is passed the system will use the current user !!!
*/
function getUserTeams( userid )
{
	try
	{
		if( DebugModeTeamsForUser )
			window.alert( "function getUserTeams()" );
			
		var xml = "<?xml version='1.0' encoding='utf-8'?>" +
			"<soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'" +
			" xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'" +
			" xmlns:xsd='http://www.w3.org/2001/XMLSchema'>" +
			GenerateAuthenticationHeader() +
			"<soap:Body>" +
			"<RetrieveMultiple xmlns='http://schemas.microsoft.com/crm/2007/WebServices'>" +
			"<query xmlns:q1='http://schemas.microsoft.com/crm/2006/Query'" +
			" xsi:type='q1:QueryExpression'>" +
			" <q1:EntityName>team</q1:EntityName>" +
			" <q1:ColumnSet xsi:type=\"q1:ColumnSet\">" +
			" <q1:Attributes>" +
			" <q1:Attribute>name</q1:Attribute>" +
			" </q1:Attributes>" +
			" </q1:ColumnSet>" +
			" <q1:Distinct>false</q1:Distinct>" +
			" <q1:LinkEntities>" +
			" <q1:LinkEntity>" +
			" <q1:LinkFromAttributeName>teamid</q1:LinkFromAttributeName>" +
			" <q1:LinkFromEntityName>team</q1:LinkFromEntityName>" +
			" <q1:LinkToEntityName>teammembership</q1:LinkToEntityName>" +
			" <q1:LinkToAttributeName>teamid</q1:LinkToAttributeName>" +
			" <q1:JoinOperator>Inner</q1:JoinOperator>" +
			" <q1:LinkEntities>" +
			" <q1:LinkEntity>" +
			" <q1:LinkFromAttributeName>systemuserid</q1:LinkFromAttributeName>" +
			" <q1:LinkFromEntityName>teammembership</q1:LinkFromEntityName>" +
			" <q1:LinkToEntityName>systemuser</q1:LinkToEntityName>" +
			" <q1:LinkToAttributeName>systemuserid</q1:LinkToAttributeName>" +
			" <q1:JoinOperator>Inner</q1:JoinOperator>" +
			" <q1:LinkCriteria>" +
			" <q1:FilterOperator>And</q1:FilterOperator>" +
			" <q1:Conditions>" +
			" <q1:Condition>" +
			" <q1:AttributeName>systemuserid</q1:AttributeName>";

		//if no userid is passed then use current user id,  EqualUserId = is a build-in XML function 
		var sUserid = gNullToString( userid );
		if( sUserid == null )
			xml += " <q1:Operator>EqualUserId</q1:Operator>";
		else
		{   
			xml += " <q1:Operator>Equal</q1:Operator>" + 
				" <q1:Values>" + 
				" <q1:Value xsi:type=\"xsd:string\">" + sUserid + "</q1:Value>" + 
				" </q1:Values>";   
		}

		xml +=
			" </q1:Condition>" +
			" </q1:Conditions>" +
			" </q1:LinkCriteria>" +
			" </q1:LinkEntity>" +
			" </q1:LinkEntities>" +
			" </q1:LinkEntity>" +
			" </q1:LinkEntities>" +
			" </query>" +
			" </RetrieveMultiple>" +
			" </soap:Body>" +
			" </soap:Envelope>";

		var xmlHttpRequest = new ActiveXObject( "Msxml2.XMLHTTP" );
		xmlHttpRequest.Open( "POST", '/mscrmservices/2007/CrmService.asmx', false );
		xmlHttpRequest.setRequestHeader( "SOAPAction", 'http://schemas.microsoft.com/crm/2007/WebServices/RetrieveMultiple' );
		xmlHttpRequest.setRequestHeader( "Content-Type", "text/xml; charset=utf-8" );
		xmlHttpRequest.setRequestHeader( "Content-Length", xml.length );
		xmlHttpRequest.send( xml );

		//Capture and return the xml result.
		var resultXml = xmlHttpRequest.responseXML;
		if( DebugModeTeamsForUser )
			window.alert( "function getUserTeams()\nresultXml = " + resultXml );
		return resultXml;
	}
	catch( err )
	{
		window.alert( "function getUserTeams()\nerror code " + err + "\nerr name = " + err.name + "\nerr message = " + err.message );
	}
}

/***************************************************************************************/
function gIsArray( obj ) 
{
	try
	{		

		//Function to check if object is an array. If not an array is constructed and returned.
		var ret;
		if( obj == null )
			ret = false;
		else	
			ret = ( obj.constructor == Array ) ? true : false;	
		if( DebugModeTeamsForUser )
		{
			window.alert( "function gIsArray()\nobj = " + obj + "\nret = " + ret );
		}				
		return ret;
	}
	catch( err )
	{
		window.alert( "function gIsArray error code()\nerror code\t" + err + "\nerror name\t" + err.name + "\nerror message\t" + err.message );
	}
}

/***************************************************************************************/
function gNullToString( strInput )
{
	try
	{
		if( DebugModeTeamsForUser )
		{
			if( strInput == null )
				window.alert( "function gNullToString()\nstrInput is null" );
			else
				window.alert( "function gNullToString()\nstrInput = \"" + strInput + "\"" );
		}
		//gNullToString(sValue) : Function to replace Null with empty string
		if( strInput == null || strInput == "null" || strInput == "undefined" )
			return null;
		else
			return strInput;
	}
	catch( err )
	{
		window.alert( "function gNullToString()\nerror code\t" + err + "\nerror name\t" + err.name + "\nerror message\t" + err.message );
	}
}

/***************************************************************************************/
function AmISoftwareDeveloper()
{
	try
	{
		if( DebugModeTeamsForUser ) 
			window.alert( "function AmISoftwareDeveloper()" );
		return IsAuthorizedForTeams( ["Software Development"] );
	}
	catch( err )
	{
		window.alert( "function AmISoftwareDeveloper()\nerror code\t" + err + "\nerror name\t" + err.name + "\nerror message\t" + err.message );
	}
}

/***************************************************************************************/
function AmIShowGeneralHidden()
{
	try
	{
		if( DebugModeTeamsForUser ) 
			window.alert( "function AmIShowGeneralHidden()" );
		return IsAuthorizedForTeams( ["Show General Hidden"] );
	}
	catch( err )
	{
		window.alert( "function AmIShowGeneralHidden()\nerror code\t" + err + "\nerror name\t" + err.name + "\nerror message\t" + err.message );
	}
}

/***************************************************************************************
	The above function is used to determine if the current user is member of a team in MS CRM (example 1). 
	You can also check multiple teams at once (example 2). 
	By passing a user GUID you can also check any other user in the system (example 3).
	

//Example 1 : one team for the current user (without userid)
IsAuthorizedForTeams('Team Name 1');                                      

//Example 2: check multiple teams in an array for current user (without userid)
IsAuthorizedForTeams(['Team Name 1','Team Name 2']);

//Example 3: check multiple teams in an array for a specific user (with userid)
IsAuthorizedForTeams(['Team Name 1','Team Name 2'], 'D0E6A11A-C407-DE11-959F-0003FF4F615E');


function ValidateUser()
{
	try
	{
		if( DebugModeTeamsForUser )
			window.alert( "function ValidateUser()" );
		var ret = IsAuthorizedForTeams( "Service Mgmt" );
		window.alert( "IsAuthorizedForTeams( \"Service Mgmt\" ) is " + ret );
		return ret;
	}
	catch( err )
	{
		window.alert( "function ValidateUser error code " + err );
	}
}	
*/

/* End of lines ***********************************************************************/
