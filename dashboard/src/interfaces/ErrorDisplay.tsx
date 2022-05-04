import { ApolloError } from "@apollo/client";
import { Button } from "@mui/material";
import React from "react";
import { Versions } from "../constants";

  // The error display function takes the error object passed in and creates the elements/messages to be rendered
  function ErrorDisplay (
    errorObject: ApolloError,
    setSubgraphToQuery: React.Dispatch<React.SetStateAction<any>>,
    protocolSchemaData: any,
    subgraphToQuery: {url: string, version: string},
  ) {
    const errorMsgs = [];
    let errorTotalCount = 0;
    let errorDisplayCount = 0;
    if (errorObject.networkError) {
      // Default error message
      errorTotalCount += 1;
      errorDisplayCount += 1;
      errorMsgs.push(<li>NetworkError - Queried URL {subgraphToQuery.url} - Try reloading</li>);
    }
    if (errorObject.graphQLErrors.length > 0) {
      errorTotalCount += errorObject.graphQLErrors.length;
      // query errors
      for (let x = 0; x < 5; x++) {
        // Take up to the first 5 query error messages and push them to the errorMsgs array
        if (!errorObject.graphQLErrors[x]) {
          break;
        }
        errorDisplayCount += 1;
        errorMsgs.push(<li> {errorObject.graphQLErrors[x].message}</li>);
      }
      if (errorObject.graphQLErrors.length <=5) {
        // If there are less or eq to 5 query errors, reccomend comparing the subgraph schema to the common schema for discrepancies
        errorMsgs.push(<h3>The fields were expected in schema version {subgraphToQuery.version} but are not present in this subgraph. Verify that your schema has all of the fields that are in the common {protocolSchemaData?.protocols[0].type} {protocolSchemaData?.protocols[0].version} schema.</h3>);
      } else {
        // If there are more than 5 query errors, it is possible the schemaVersion on the protocol entity was not updated. Allow the user to select querying on a different schema version
        errorMsgs.push(
          <>
            <h2>Queried {protocolSchemaData?.protocols[0].type} schema version {protocolSchemaData?.protocols[0].schemaVersion} - Select a different schema to query below:</h2>
            {/* Create a button for every other schema version */}
            {Versions.SchemaVersions.map((version: string) => {
              if (version === protocolSchemaData?.protocols[0].schemaVersion) {
                return null;
              }
              return <Button onClick={() => setSubgraphToQuery({url: subgraphToQuery.url, version: version})}>Schema {version}</Button>
            })}
          </>
        );
      }
    }

    if (errorMsgs.length >= 1) {
      return (<div style={{margin: "4px 24px", border: "yellow 3px solid", paddingTop: "6px"}}><h3>DISPLAYING {errorDisplayCount} OUT OF {errorTotalCount} ERRORS.</h3><ol>{errorMsgs}</ol></div>);
    } else {
      return null;
    }
  }

export default ErrorDisplay;