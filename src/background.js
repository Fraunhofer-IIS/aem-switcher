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

function lg(string,string2) {
    console.log(string,string2);
}

function changeUrlAndOpenTab(baseUrlBefore, baseUrlAfter, myurl, tabs) {
    myurl = myurl.replace(baseUrlBefore, baseUrlAfter);
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
        const myurl = tab.url;
        const storageItem = browser.storage.sync.get(STORAGE_REF);
        storageItem.then((ressource) => {
            if (ressource.mandantenliste && ressource.mandantenliste.length > 0) {
                ressource.mandantenliste.forEach(mandant => {
                    var aemhomepage = mandant.aem + "de.html";
                    if (myurl.indexOf(mandant.live) == 0) {
                        // Ausnahmefall Homepage
                        if (myurl === mandant.live) {
                            mandant.aem = aemhomepage;
                        }
                        changeUrlAndOpenTab(mandant.live, mandant.aem, myurl, tabs);
                    } else if (myurl.indexOf(mandant.aem) == 0) {
                        changeUrlAndOpenTab(mandant.aem, mandant.live, myurl, tabs);
                    }
                });
            }
        });
    });

}
browser.browserAction.onClicked.addListener(main);
browser.commands.onCommand.addListener(main);