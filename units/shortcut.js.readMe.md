Handling Keyboard Shortcuts in JavaScript
Despite the many JavaScript libraries that are available today, I cannot find one that makes it easy to add keyboard shortcuts(or accelerators) to your javascript app. This is because keyboard shortcuts where only used in JavaScript games - no serious web application used keyboard shortcuts to navigate around its interface. But Google apps like Google Reader and Gmail changed that. So, I have created a function to make adding shortcuts to your application much easier.

Update
This is the second version of this script. The following modifications were made...

The single function method was abandoned for an object with two functions
Shortcut Remove function added
New option to disable shortcuts in textarea, input fields.
New option to manually specify keycode to watch for.
Meta Key for Mac supported (Thanks, Dj Walker-Morgan)
The documentation for the last version is still available.

Thanks for all the comments and suggestions, guys.

Demo
Just press the shown combinations - if the script works, the status will changed to 'Called'. For example, press the key '1'...

1
Function Called : Not Yet
Ctrl+1
Function Called : Not Yet
Alt+1
Function Called : Not Yet
Shift+1
Function Called : Not Yet
Ctrl+Shift+1
Function Called : Not Yet
Ctrl+Alt+1
Function Called : Not Yet
Shift+Alt+1
Function Called : Not Yet
Ctrl+2 - Remove Shortcut
Function Called : Not Yet
If you click the 'Remove Shortcut' Link before pressing the Ctrl+2 Combination, the function should NOT be called.
3 - With disable_in_input = true
 The function should NOT be called when typing '3' in the input field
Function Called : Not Yet
4
Function Called : Not Yet
This uses the 'keycode' option.
Ctrl+A - With propagate = true
Function Called : Not Yet
If Ctrl+A is pressed, it will call the function and then propagate the event to the browser - selecting the text.
Try it out...

Live Evaluation
shortcut.add("Ctrl+Shift+X",function() {
	alert("Hi there!");
});


Documentation
Add Shortcut
Remove Shortcut
shortcut.add()
First Argument : The Shortcut Key Combination - String
The shortcut key combination should be specified in this format ... Modifier[+Modifier..]+Key. More about this in the Supported Keys section.
Second Argument : Function to be called - Function
Specify the function here. This function will be called if the shortcut key is pressed. The event variable will be passed to it.
Third Argument[OPTIONAL] : Options - Associative Array
This argument must be an associative array with any of these three options...

type - String
The event type - can be 'keydown','keyup','keypress'. Default: 'keydown'
disable_in_input - Boolean
If this is set to true, keyboard capture will be disabled in input and textarea fields. If these elements have focus, the keyboard shortcut will not work. This is very useful for single key shortcuts. Default: false
target - DOM Node
The element that should be watched for the keyboard event. Default : document
propagate - Boolean
Allow the event to propagate? Default : false
keycode - Integer
Watch for this keycode. For eg., the keycode '65' is 'a'.
Example...
{
'type':'keydown',
'propagate':false,
'disable_in_input':true,
'target':document,
'keycode':65
}
Example Code

shortcut.add("Ctrl+B",function() {
	alert("The bookmarks of your browser will show up after this alert...");
},{
	'type':'keydown',
	'propagate':true,
	'target':document
});
shortcut.remove()
Just one argument - the shortcut combination that was attached to a function earlier. Make sure that this is exactly the same string that you used while adding the shortcut.

Example Code

shortcut.add("Ctrl+B",function() {
	alert("Bold");
});
//Remove the shortcut
shortcut.remove("Ctrl+B");
Supported Keys
The shortcut keys should be specified in this format ...

Modifier[+Modifier..]+Key
Example...

Ctrl+A
The valid modifiers are

Ctrl
Alt
Shift
Meta
You can specify a sequence without a modifier as well - like this...

shortcut.add("X",function() {
	alert("Hello!");
});
The valid Keys are...
All alpha/numeric keys - abc...xyz,01..89
Special Characters - Every special character on a standard keyboard can be accessed.
Special Keys...
Tab
Space
Return
Enter
Backspace
Scroll_lock
Caps_lock
Num_lock
Pause
Insert
Home
Delete
End
Page_up
Page_down
Left
Up
Right
Down
F1
F2
F3
F4
F5
F6
F7
F8
F9
F10
F11
F12
These keys are case insensitive - so don't worry about using the correct case.

This library is in beta - so expect some problems. Suggestions are welcome.