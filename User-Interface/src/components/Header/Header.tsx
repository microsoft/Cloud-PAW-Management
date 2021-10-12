import './Header.css';
import { SearchBox } from '@fluentui/react';

export const Header = () => {
    return (
        <div className="header">
            <div className="topnav">
                <a href="#home">Microsoft Azure (Preview)</a>
                <input type="text" placeholder="Search resources, services, and docs (G+/)" />
                
            </div>
            <div className = "breadcrumb">
                <ul className="breadcrumb">
                    <li><a href="#">Home &#62;</a></li>
      
                </ul>
            </div>
            <div className="titleheader">
                <a href="#home">Lifecycle Management : All PAWs</a><br/>
                <span>Microsoft - Azure Active Directory</span>
            </div>
        </div>
        
    )
}
