# User Manual

* [User Manual](#user-manual)
  * [Introduction](#introduction)
    * [Notable Features](#notable-features)
    * [Online Storage](#online-storage)
  * [Installation](#installation)
    * [Chrome Web Store](#chrome-web-store)
    * [Local](#local)
  * [Registration](#registration)
  * [Use](#use)
    * [Preparation](#preparation)
    * [Day Tracker](#day-tracker)
    * [Reminders](#reminders)
  * [Roadmap](#roadmap)
  * [Disclaimer](#disclaimer)
    * [The Lack of Encryption](#the-lack-of-encryption)

## Introduction

This application is a Google Chrome browser extension that extends [Notion](https://notion.so). It is intended for use by Role Players and Role-Playing Storytellers, so some content of this document might not make any sense to you if you aren't familiar with the concept of P&P RPGs.

This extension provides a synchronized day tracker and reminder system and inserts it into an existing Notion workspace. This means that you can track the current in-game day for each game, add reminders for future in-game days and get alerts if one of those reminders gets triggered whenever you change the in-game day.

This extension is currently a work in progress and not feature-complete. Until a major version (v1) has been reached, data loss may still be possible.

### Notable Features

### Online Storage

The data (the current in-game day & reminders) is being stored online, so you can access it on multiple machines and so clearing browser data does not delete all your reminders. For that reason, it is necessary to register and sign in in order to view your personal data.\
If you do not want any data to be stored online, you should not use this extension. Pure offline use leveraging and import/export system is on the roadmap though.

#### Data Synchronization

The data is being kept in-sync with the online storage system ([Firebase](https://firebase.google.com), if you're curious). That means that changing them in one tab will automatically update any other tabs you (or someone you shared your credentials with) opened that same workspace in.

<!-- TODO: add gif -->

#### Separate Games

Since a lot of storytellers and players usually have multiple games going, this extension features workspace separation. If you create a separate workspace for each game you're playing, you can track day and reminders for each game separately.

<!-- TODO: add gif -->

_Attention_: Due to technical constraints, workspaces are being distinguished by their name. If you have two workspaces with the same name, you will see the same in-game day and reminders in both workspaces.

## Installation

### Chrome Web Store

The extension is not yet available in the Chrome Web Store.

### Local

Releases of the extension can be downloaded [here](https://github.com/jagoe/notion-rpg-time-tracker/releases).

1. Pick the latest release and download the archive named `notion-rpg-day-tracker.<version>.zip` (with version being the respective release version)
2. In Chrome, navigate to <chrome://extensions>
3. In the top right corner, toggle "Developer mode" on
4. Click "Load unpacked" and select the downloaded archive
5. That's it, the extension has been installed

## Registration

Before you can use the extension, you have to register using an email address and a password. The email address does not have to be valid, but you will not be able to reset your password or change your login email address. You will never receive any email from us that do not pertain to account management. As of now, you will not receive any emails from us at all.

To register, follow these simple instructions:

1. Click on the new calendar icon left of the "Share" button in the top right menu bar <!-- TODO: image here -->
2. Click on the "Register" link <!-- TODO: image here -->
3. Fill in registration information and submit the form <!-- TODO: image here -->
4. You are registered and signed in now - there will not be an email confirmation <!-- TODO: image here -->

## Use

### Preparation

There isn't really any preparation necessary, but make sure that you _really_ like your workspace names before you create reminders for them.\
Renaming workspaces can not be recognized by the extension, so a renamed workspace will be treated like a new workspace. The same is true for duplicate workspace names - they will be treated as the same workspace by the extension.

<!-- TODO: gif of workspace renaming here -->

This shortcoming will be addressed by introducing the import/export feature in a later update.

### Day Tracker

The day tracker can be found next to the calendar icon and you can use it to track the current in-game day. It can not go below `1`.\
Whenever the tracker reaches a day with reminders, those reminders will pop up at the top of the page. <!-- TODO: gif here -->

Tracking back will "rewind" the reminders, so don't have to recreate them if you accidentally navigated to the wrong day. <!-- TODO: gif here -->

### Reminders

Clicking on the calendar icon will open the reminders popup where you can look at open reminders and create new ones. <!-- TODO: gif here -->

#### Adding reminders

Reminders can be added by setting the _absolute_ or the _relative_ day they will be triggered on, entering the reminder and then clicking the "+"-Button or pressing the Enter key.

__Absolute__: Just enter the day the reminder should be triggered on. <!-- TODO: gif here -->\
__Relative__: Enter "+" followed by the amount of days _from now_ the reminder should be triggered on. <!-- TODO: gif here -->

#### Deleting reminders

By clicking on the "—"-Button, you can delete a reminder. Be careful though, deleted reminders can _not_ be recovered. <!-- TODO: gif here -->

## Roadmap

Our roadmap is pretty unorganized, but here are some issues we want to address in the near future:

* Recurring events: Some events may regularly, such as monthly costs.
* Data import/export: This will make it possible to copy/move workspaces without losing data and is the foundation for offline storage.
* Offline storage: We understand that some users prefer not to store data online and we work on accommodating those users.
* Calendar (maybe): We chose days as the tracking unit, because different settings use different calendars. For that reason, this feature needs support for custom calendars, which is a hard maybe.

## Disclaimer

We do not collect any data, but we do store application data online. That data is limited to:

* hashes of the workspaces you are using
* the [_unencrypted_](#the-lack-of-encryption) in-game days and reminders per workspace
* the email address you use to sign in
* a hash of the password you use to sign in

We do not share any of that data with third parties, nor will we ever do that.

### The Lack of Encryption

Data encryption would require you to store a key or enter your password every time you opened Notion in a new tab, otherwise we'd have to store the key and that would defeat the purpose.\
Considering that the stored data (current in-game days and reminders) should not be sensitive at all, we decided that convenience is more important than the hassle that comes with unnecessary security. If that doesn't work for you, there will be an offline storage feature that stores everything on your machine which makes encryption unnecessary.
