const ID_TEMPLATE_MANDANT = '#mandant-list-template';
const CLASS_CONTAINER_OPTIONS = '.options-container';
const CLASS_CONTAINER_MANDANT = '.mandant-settings-pair';
const CLASS_CONTAINER_FIRST_LINE = '.mandant-first-line';
const CLASS_CONTAINER_SECOND_LINE = '.mandant-second-line';
const CLASS_URL_INPUT_LIVE = '.url-input-live';
const CLASS_URL_INPUT_AEM = '.url-input-aem';
const CLASS_BUTTON_EDIT = '.button-edit';
const CLASS_BUTTON_DELETE = '.button-delete';
const CLASS_BUTTON_SAVE = '.button-save';
const STORAGE_MANDANTEN = 'mandantenliste';
const CLASS_SHORTCUT_DISPLAY = '.input-shortcut';
const CLASS_BUTTON_SAVE_SHORTCUT = '.button-save-shortcut';
const CLASS_BUTTON_SET_SHORTCUT = '.button-set-shortcut';
const CLASS_BUTTON_RESET_SHORTCUT = '.button-reset-shortcut';
const COMMAND_SWITCH = 'switch'; // definert in manifest.json
const DATA_ATTRIBUTE_ID = 'data-id';

async function restoreOptions(event) {
    
    const storageMandanten = browser.storage.sync.get(STORAGE_MANDANTEN);
    await storageMandanten.then( ressource => {
        if (ressource.mandantenliste && ressource.mandantenliste.length > 0) {
            ressource.mandantenliste.forEach(mandant => {
                addConfigItem(mandant.id, mandant.live, mandant.aem);
            });
        }
    });

    await browser.commands.getAll().then( commands => {
        commands.forEach( command => {
            if (command.name === COMMAND_SWITCH) {
                document.querySelector(CLASS_SHORTCUT_DISPLAY).value = command.shortcut;
            }
        })
    });

    // event.preventDefault();
}

function addConfigItem(id, live, aem) {
    const template = document.querySelector(ID_TEMPLATE_MANDANT).content.querySelector("div");
    const node = document.importNode(template, true);
    node.setAttribute(DATA_ATTRIBUTE_ID, id);
    node.querySelector(CLASS_URL_INPUT_LIVE).value = live;
    node.querySelector(CLASS_URL_INPUT_LIVE).title = aem;
    node.querySelector(CLASS_URL_INPUT_AEM).value = aem;

    node.querySelector(CLASS_BUTTON_EDIT).addEventListener('click', handleEditButtonClick);
    node.querySelector(CLASS_BUTTON_DELETE).addEventListener('click', handleDeleteButtonClick);
    node.querySelector(CLASS_BUTTON_SAVE).addEventListener('click', handleSaveButtonClick);

    document.querySelector(CLASS_CONTAINER_OPTIONS).appendChild(node);
}

function handleEditButtonClick(event) {
    const container = event.target.closest(CLASS_CONTAINER_MANDANT);
    container.querySelector(CLASS_URL_INPUT_LIVE).removeAttribute('disabled');
    container.querySelector(CLASS_URL_INPUT_AEM).removeAttribute('disabled');
    container.querySelector(CLASS_CONTAINER_SECOND_LINE).removeAttribute('style');
    event.preventDefault();
}

function handleDeleteButtonClick(event) {
    const container = event.target.closest(CLASS_CONTAINER_MANDANT);
    const id = container.getAttribute(DATA_ATTRIBUTE_ID);

    removeMandant(id);
    event.preventDefault();
}

function handleSaveButtonClick(event) {
    const container = event.target.closest(CLASS_CONTAINER_MANDANT);
    const id = container.getAttribute(DATA_ATTRIBUTE_ID);
    const live = container.querySelector(CLASS_URL_INPUT_LIVE).value;
    const aem = container.querySelector(CLASS_URL_INPUT_AEM).value;

    updateMandant(id, live, aem);
    event.preventDefault();
}

async function addMandant() {

    const storageItem = browser.storage.sync.get(STORAGE_MANDANTEN);
    await storageItem.then((ressource) => {

        const newMandant = {
            id: getLastIndex(ressource.mandantenliste)+1,
            live: document.querySelector("#new-url-live").value.trim(),
            aem: document.querySelector("#new-url-aem").value.trim()
        }

        if (ressource.mandantenliste) {
            ressource.mandantenliste.push(newMandant);
        } else {
            ressource.mandantenliste = [newMandant];
        }
        browser.storage.sync.set(ressource);
    });

    //Eingabefelder leeren
    document.querySelector("#new-url-live").value='';
    document.querySelector("#new-url-aem").value='';

    location.reload();
}

function getLastIndex(mandantenliste) {
    var lastIndex = 0;
    if (mandantenliste) {
        mandantenliste.forEach( mandant => {
            lastIndex = Math.max(lastIndex, mandant.id);
        });
    }
    return lastIndex;
}

async function updateMandant(id, live, aem) {

    const storageItem = browser.storage.sync.get(STORAGE_MANDANTEN);
    await storageItem.then((ressource) => {
        if (ressource.mandantenliste) {
            ressource.mandantenliste.forEach( mandant => {
                if (mandant.id == id) {
                    mandant.live = live;
                    mandant.aem = aem;
                }
            });
        }
        browser.storage.sync.set(ressource);
    });

    location.reload();
}

async function removeMandant(id) {

    const storageItem = browser.storage.sync.get(STORAGE_MANDANTEN);
    await storageItem.then((ressource) => {
        if (ressource.mandantenliste) {
            ressource.mandantenliste = ressource.mandantenliste.filter( mandant => {
                return mandant.id != id;
            });
        }
        browser.storage.sync.set(ressource);
    });

    location.reload();
}

async function handleSaveShortcut(event) {

    document.querySelector(CLASS_SHORTCUT_DISPLAY).setAttribute('disabled', true);

    await browser.commands.update({
        name: COMMAND_SWITCH,
        shortcut: document.querySelector(CLASS_SHORTCUT_DISPLAY).value
    });

    location.reload();
}

async function handleSetShortcut(event) {

    document.querySelector(CLASS_SHORTCUT_DISPLAY).removeAttribute('disabled');
    document.querySelector(CLASS_BUTTON_SAVE_SHORTCUT).removeAttribute('style');
    document.querySelector(CLASS_SHORTCUT_DISPLAY).addEventListener('keydown', handleKeyInput);
    document.querySelector(CLASS_SHORTCUT_DISPLAY).focus();
}

function handleKeyInput(event) {
    const key = (event.keyCode != 16 && event.keyCode != 17 && event.keyCode != 18) ? event.key : '';
    const text = (event.ctrlKey ? 'Ctrl+' : '') + (event.altKey ? 'Alt+' : '') + (event.shiftKey ? 'Shift+' : '') + key.toUpperCase();
    document.querySelector(CLASS_SHORTCUT_DISPLAY).value = text;
}

async function handleResetShortcut(event) {

    await browser.commands.reset(COMMAND_SWITCH);

    location.reload();
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form#newMandant button").addEventListener("click", addMandant);
document.querySelector("#shortcut .button-save-shortcut").addEventListener("click", handleSaveShortcut);
document.querySelector("#shortcut .button-set-shortcut").addEventListener("click", handleSetShortcut);
document.querySelector("#shortcut .button-reset-shortcut").addEventListener("click", handleResetShortcut);
