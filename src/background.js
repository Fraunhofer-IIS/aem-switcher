const STORAGE_REF = 'mandantenliste';

function callOnActiveTab(callback) {
    getCurrentWindowTabs().then((tabs) => {
        for (var tab of tabs) {
            if (tab.active) {
                callback(tab, tabs);
            }
        }
    });
}

function getCurrentWindowTabs() {
    return browser.tabs.query({
        currentWindow: true
    });
}

function openTab(myurl, tabs) {
    var tabfound = false;
    for (var tab of tabs) {
        if (tab.url == myurl) {
            browser.tabs.update(tab.id, {
                active: true
            });
            tabfound = true;
            break;
        }
    }
    if (!tabfound) {
        browser.tabs.create({
            url: myurl
        });
    }
}

main = function() {

    callOnActiveTab((tab, tabs) => {
        var myurl = tab.url;
        const storageItem = browser.storage.sync.get(STORAGE_REF);
        storageItem.then((ressource) => {
            if (ressource.mandantenliste && ressource.mandantenliste.length > 0) {
                ressource.mandantenliste.forEach(mandant => {
                    var homepageSuffix = "de.html";
                    if (myurl.indexOf(mandant.live) == 0) {
                        // Ausnahmefall Homepage live
                        if (myurl == mandant.live) {
                            myurl = mandant.aem + homepageSuffix;
                        }
                        else {
                            myurl = myurl.replace(mandant.live, mandant.aem);
                        }
                        openTab(myurl, tabs);
                    } else if (myurl.indexOf(mandant.aem) == 0) {
                        //Aushamefall Homepage aem
                        if (myurl.substr(-homepageSuffix.length) == homepageSuffix) {
                            myurl = mandant.live;
                        }
                        else
                        {
                            myurl = myurl.replace(mandant.aem, mandant.live);
                            //? Parameter abschneiden
                            if (myurl.indexOf('?') > 0) {
                                myurl = myurl.slice(0, myurl.indexOf('?'))
                            }
                        }
                        openTab(myurl, tabs);
                    }
                });
            }
        });
    });

}
browser.browserAction.onClicked.addListener(main);
browser.commands.onCommand.addListener(main);