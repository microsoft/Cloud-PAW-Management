import './Header.css';
import {AzureSearchBox} from '../SearchBox/AzureSearchBox';
import * as React from 'react';
import { mergeStyles } from '@fluentui/react/lib/Styling';

export const Header = () => {
    return (
        <div className="header">
            <div className="topnav">
                <a href="#home">Microsoft Azure (Preview)</a>
                <AzureSearchBox />
            </div>
            <div className = "breadcrumb">
                <ul className="breadcrumb">
                    <li><a href="#">Home &#62;</a></li>
                </ul>
            </div>
            <div className="titleheader">
   <table>
      <tr><td><span className="fxs-blade-header-icon" id="_weave_e_411">
         <svg height="30px" width="30px" aria-hidden="true" role="presentation" focusable="false">
            <use href="{groups}"></use>
         </svg>
      </span></td><td>
      <a href="#home">Lifecycle Management | All PAWs </a><br/></td></tr>
      <tr><td></td><td><span className="titleheaderspan">Microsoft - Azure Active Directory</span></td></tr>
   </table>
</div>    
</div>         
    )
}
