# Picture-in-picture selection screenshot

Work in progress !

## ressources

This allows you to populate PiP with pretty much anything: --- [document picture-in-picture](https://wicg.github.io/document-picture-in-picture/)  
To get screenshot from a rectangle selection --- [html2canvas docs](https://html2canvas.hertzen.com)

## test it for yourself

download the folder  
load the extension with chrome (load unpacked extension)  
click the extension icon  
click the popup button  
draw a rectangle and see result

## explanation

Works in essence, the limitation for now is that html2canvas  
doesn't wait for images or loaded content when taking screenshot  
so it is useful for text atleast. Also it doesn't work on every  
site, test it on wikipedia for example not on twitch or youtube.

## TODO:

- a bit slow
- findout why it doesn't work on some sites (yt, twitch)
- add shortcut for taking screenshot, and options to setup the keybind yourself
- add css to popup.html
- remove red rectangle and opactiy from overlay in the actual screenshot
- maybe find better way to take screenshot from selection  
