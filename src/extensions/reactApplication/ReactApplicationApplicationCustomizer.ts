//import * as React from "react";  
//import * as ReactDOM from "react-dom";  
//import Footer, { IReactFooterProps } from '../Footer';
import { IWebPartContext } from '@microsoft/sp-webpart-base';
//Import SPHttpClient
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { SPPermission } from '@microsoft/sp-page-context';

import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,  
  PlaceholderName 
} from '@microsoft/sp-application-base';
//import { Dialog } from '@microsoft/sp-dialog';
import styles from '../AppCustomizer.module.scss';  
import { escape } from '@microsoft/sp-lodash-subset';
//CustomHeaderFooterApplicationCustomizer.module.scss

import * as strings from 'ReactApplicationApplicationCustomizerStrings';
// import * as $ from 'jquery';
 import pnp from 'sp-pnp-js';

  const LOG_SOURCE: string = 'ReactApplicationApplicationCustomizer';

/** 
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */

export interface IReactApplicationApplicationCustomizerProperties {
  
   Top: string;
    Bottom: string;
    Title:string;
  //testMessage: string; 
  
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class ReactApplicationApplicationCustomizer
  extends BaseApplicationCustomizer<IReactApplicationApplicationCustomizerProperties> {
    private _bottomPlaceholder: PlaceholderContent | undefined;
    private _topPlaceholder: PlaceholderContent | undefined;
  @override
  public onInit(): Promise<void> {
    //Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    pnp.setup({  
      spfxContext: this.context  
  }); 
  pnp.sp.web.lists.getByTitle("newlist").items.select("Title", "ID").getPaged().then(p => {  
    console.log(JSON.stringify(p.results));  
    var itemColl = p.results;  
    for (var index = 0; index < itemColl.length; index++) {  
        var element = itemColl[index];  
        var title = element["Title"];  
        var id = element["ID"];  
        console.log("Item  Id: " + id + " and title: " + title  );  
        
    }  
}); 
     

    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);
    this._renderPlaceHolders(); 
     
    //this.createList();
    
  
    
    return Promise.resolve();
  } 
  private _renderPlaceHolders(): void {  
    // console.log('HelloWorldApplicationCustomizer._renderPlaceHolders()');  
    // console.log('Available placeholders: ',  
    // this.context.placeholderProvider.placeholderNames.map(name => PlaceholderName[name]).join(', '));  
      
    // Handling the top placeholder  
    if (!this._topPlaceholder) {  
      this._topPlaceholder =  
        this.context.placeholderProvider.tryCreateContent(  
          PlaceholderName.Top,
         

          { onDispose: this._onDispose });  
      
      // The extension should not assume that the expected placeholder is available.  
      if (!this._topPlaceholder) {  
        console.error('The expected placeholder (Top) was not found.');  
        return;  
      }  
      
      if (this.properties) {  
        let topString: string = this.properties.Top;  
        if (!topString) {  
          topString = '(Top property was not defined.)';  
        }  
      
        if (this._topPlaceholder.domElement) {  
          this._topPlaceholder.domElement.innerHTML = `  
            <div class="${styles.app}">  
              <div class="ms-bgColor-themeDark ms-fontColor-white ${styles.top}">  
                 ${escape(topString)}  
              </div> <br>
               <input type="text" name="name" value="name" > 
            </div>`;  
        }  

      }  
    }  
     // Handling the bottom placeholder  
     if (!this._bottomPlaceholder) {  
      this._bottomPlaceholder =  
        this.context.placeholderProvider.tryCreateContent(  
          PlaceholderName.Bottom,  
          { onDispose: this._onDispose });  
      
      // The extension should not assume that the expected placeholder is available.  
      if (!this._bottomPlaceholder) {  
        console.error('The expected placeholder (Bottom) was not found.');  
        return;  
      }  
      
      if (this.properties) {  
        let bottomString: string = this.properties.Bottom;  
        if (!bottomString) {  
          bottomString = '(Bottom property was not defined.)';  
        }  
      
        if (this._bottomPlaceholder.domElement) {  
          this._bottomPlaceholder.domElement.innerHTML = `  
            <div class="${styles.app}">  
              <div class="ms-bgColor-themeDark ms-fontColor-white ${styles.bottom}">  
                <i class="ms-Icon ms-Icon--Info" aria-hidden="true"></i> ${escape(bottomString)}  
              </div>  
            </div>`;  
        }  
      }  
    }  
 }  
 

  private _onDispose(): void {  
    console.log('[ReactHeaderFooterApplicationCustomizer._onDispose] Disposed custom top and bottom placeholders.');  
} 
public static checkListExists(context: IWebPartContext, listTitle: string): Promise<boolean> {
  return context.spHttpClient.get(context.pageContext.web.absoluteUrl
      + "/_api/web/lists/GetByTitle('"
      + listTitle
      + "')?$select=Title", SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
          if (response.status === 404) {
              return false;
          }
          else {
              return true;
          }
      });
}
public static createList(context: IWebPartContext,
  listTitle: string,
  listDescription: string,
  baseTemplate: number,
  enableApproval: boolean = true,
  enableVersioning: boolean = false): Promise<any> {

  console.log(`create list ${listTitle}`);

  const reqJSON: any = JSON.parse(
      `{
      "@odata.type": "#SP.List",
      "AllowContentTypes": true,
      "BaseTemplate": ${baseTemplate},
      "ContentTypesEnabled": true,
      "Description": "${listDescription}",
      "Title": "${listTitle}"
  }`);

  if (enableApproval){
      reqJSON.EnableModeration = true;
  }

  if (enableVersioning){
      reqJSON.EnableVersioning = true;
  }

  return context.spHttpClient.post(context.pageContext.web.absoluteUrl + "/_api/web/lists",
      SPHttpClient.configurations.v1,
      {
          body: JSON.stringify(reqJSON),
          headers: {
              "accept": "application/json",
              "content-type": "application/json"
          }
      })
      .then((response: SPHttpClientResponse): Promise<any> => {
          console.log("result: " + response.status);
          return response.json();
      });
}
}
