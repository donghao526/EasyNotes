$(document).ready( function(){

	if($('#title').text() == ""){
		$('#title').text('Add The Title');
		$('#title').css('color','#DCDCDC');
	}
	if($('#textEditor').text() == ""){
		$('#textEditor').text('Add The Content');
		$('#textEditor').css('color','#DCDCDC');		
	}

	Notes.init();
});

$('#add').click(function(){

	// Get the condition to check if the user has input something
    var condition1 = (($('#textEditor').text() == "Add The Content") && ($('#textEditor').css('color') == "rgb(220, 220, 220)"));
	var condition2 = (($('#title').text() == "Add The Title") && ($('#title').css('color') == "rgb(220, 220, 220)"));

	// Check if the user has input something
	if(!(condition1 && condition2)){
		$('#title').text("Add The Title");
		$('#title').css('color','#DCDCDC');	
		$('#textEditor').text("Add The Content");
		$('#textEditor').css('color','#DCDCDC');	
	}

	// Click the add button, restore the backgroud color of the selected item
	if(Notes.currentIndex != -1){
		$($('a#item')[Notes.currentIndex]).css('background-color','#FFFFFF');
		Notes.currentIndex = -1;
	}

});

$('#save').click(function(){

	// Check if the title and content has input
	var condition1 = (($('#textEditor').text() == "Add The Content") && ($('#textEditor').css('color') == "rgb(220, 220, 220)"));
	var condition2 = (($('#title').text() == "Add The Title") && ($('#title').css('color') == "rgb(220, 220, 220)"));

	if(condition1){
		alert("Please input the text first.");
		return ;
	}
	if(condition2){
		alert('Please input the content first.');
		return;
	}

	var title = $('#title').text();
	var content = $('#textEditor').text();

	Notes.saveItem(title,content);
});

// When the title area focused, Clear the text and Set the color of text to black
$('#title').focus(function(){
	if($('#title').text() == "Add The Title"){
		$('#title').text('');
		$('#title').css('color','#000000');		
	}		
});

// When the Content area focused, Clear the text and
// Set the color of text to black
$('#textEditor').focus(function(){
	if($('#textEditor').text() == "Add The Content"){
		$('#textEditor').text('');
		$('#textEditor').css('color','#000000');		
	}
		
});

// When the title area losed the focus
$('#title').blur(function(){
	if($('#title').text() == ""){
		$('#title').text("Add The Title");
		$('#title').css('color','#DCDCDC');		
	}
		
});

// When the content area losed the focus
$('#textEditor').blur(function(){
	if($('#textEditor').text() == ""){
		$('#textEditor').text("Add The Content");
		$('#textEditor').css('color','#DCDCDC');		
	}	
});

$('#delete').click(function(){
	Notes.deleteItem();
});
