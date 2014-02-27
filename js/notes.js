var Notes = {

	// Initialize the interface of the application
	init: function(){
		this.db = this.openDB();
		this.db.transaction(function(ts){

			// display the title List in the left side
			ts.executeSql('SELECT * FROM Notes order by id desc', [], function(ts, result){
			var title = '';

			// divide the items into several pages
			Notes.itemDivide(result);

 			},
 			// Handel the error 
			function(ts, error){
				alert(error);
			});
		});
		this.registerPageAction();
	},

	// Item list divide 
	itemDivide: function(result){

		// Record the sum number of items and refresh the page icon
		this.itemSumNum = result.rows.length;

        // The displacement of the page
        this.pageDisplacement = 0;

        // Refresh the page icon
		this.refreshPageIcon();

		// Get the length of the note items
		var len = result.rows.length < 10? result.rows.length: 10;
	
		// fill the item list

        var titleDisplay;

        for(var currentRow = 0; currentRow < len; currentRow++){

            titleDisplay = result.rows.item(currentRow).title;
            if(titleDisplay.length > 20)
                titleDisplay = titleDisplay.substr(0,20)+"...";

			title = '<a href="#" class="list-group-item" id="item">'+ titleDisplay + '</a>';
			$("#titleList").append(title);
		}


		this.dataset  = result.rows;

		// current Page base number, if the lists can only fill one page set the initial value 0
		this.currentPageBase = 0;

		// Prepare the new id for new insert item
		this.newId = (result.rows.length > 0)? ++result.rows.item(0).id : 0;

		// Set the index of the title list
		this.currentIndex = -1;

		// Register Item click event handler
		this.registerItemClickEvent();
	},


	// Open the database
	openDB: function(){

		// Open the database, if not exists, then create a new one
		var db = openDatabase('EasyNotes-HaHa', '2.0', 'This is the notes database', 2*1024*1024);
		if(!db){
			alert('Connect databse error');
		}

		// Check the existence of the table. If not, create a new one
		db.transaction(function(ts){
			ts.executeSql('CREATE TABLE IF NOT EXISTS NOTES(id unique, title, content, date)');
		});
		return db;
	},

	// Save the item currently edit
	saveItem: function(title, content){

		// If the item is a new create one
		if(Notes.currentIndex == -1){

			// Insert the new Item and set the title List to the first page
			this.currentPageBase = 0;
			this.itemSumNum++;
			this.insertNewItem(title, content);			
		}
		else // The item is a modified one
		{
			this.updateItem(title, content);
		}
	},

	// Insert new note item to the database
	insertNewItem: function(title, content){

    	this.db.transaction(function(ts){
    		ts.executeSql('INSERT INTO NOTES VALUES(?, ?, ?, ?)', [Notes.newId, title, content, new Date().toLocaleString()]);
    		Notes.newId ++;

            // Reset the current page base and page displacement
            Notes.currentPageBase = 0;
            Notes.pageDisplacement = 0;
    		
    		// refresh the left title List
    		Notes.refreshTitleLists();

            // refresh the page icon
            Notes.refreshPageIcon();
    	});   
	},

	// Update the modified item
	updateItem: function(title, content){

		// get the id of the currently edit one
		this.db.transaction(function(ts){
			ts.executeSql('update Notes set title = ?, content = ? where id = ?', [title, content, Notes.currentEditItemId], function(ts, result){
				Notes.refreshTitleLists();
			},
			function(ts, error){
				alert(error);
			});
		});

	},

	// delete the item
	deleteItem: function(){
		if(this.currentIndex == -1)
			alert("Please choose the item you want to edit first!");
		else{
			this.db.transaction(function(ts){
				ts.executeSql('delete from notes where id = ?', [Notes.currentEditItemId], function(ts, result){

                    Notes.itemSumNum--;       // decrease the sum number of the notes

                    // When a note is deleted, we will refresh the title and content interface, refresh the title
                    // list in the left part. At the same time, we also need to refresh the page icon
					Notes.reSetInterface();
					Notes.refreshTitleLists();
                    Notes.refreshPageIcon();
				}, 
				function(ts, error){
					console.log('Delete note item error!');
					console.log(error);
				});
			});
		}
	},

	// refresh the page icons
	refreshPageIcon: function(){

		// The page only display 10 items
		var pageCount = 10;

		var length = this.itemSumNum;

		if(length == 0)
			this.pageNum = 0;
		else
		    this.pageNum = Math.floor((length - 1) / pageCount);

		// display the bottom page icon
		for(var i = 1 ; i <= 3; i++)

			if( i <= (1 + this.pageNum))
				$('#pages li a')[i].innerText = ""+i;
			else
				$('#pages li a')[i].innerText = "..";

        // Set the background color for current page
        for(var i = 0; i < 3; i++)
            if(Notes.pageDisplacement == i)
                $($('a#pageIcon')[i + 1]).css('background-color','#EEEEEE');
            else
                $($('a#pageIcon')[i + 1]).css('background-color','#FFFFFF');
	},

    registerPageAction: function(){

        $('a#pageIcon').click(function(){

            // The page only display 10 items
            var pageCount = 10;
            var length = Notes.itemSumNum;
            var pages;

            if(length == 0)
                pages = 1;
            else
                pages = Math.floor((length - 1) / pageCount)+1;

            // Click the prev button
            if( this == $('a#pageIcon')[0]){
                if(pages > 3){
                    // The notes list need to display more than 3 pages
                    if(Notes.currentPageBase > 0){

                        // refresh the page number after clicking the prev button
                        Notes.currentPageBase--;
                        $('a#pageIcon')[1].innerText = parseInt($('a#pageIcon')[1].text) - 1 + "";
                        $('a#pageIcon')[2].innerText = parseInt($('a#pageIcon')[2].text) - 1 + "";
                        $('a#pageIcon')[3].innerText = parseInt($('a#pageIcon')[3].text) - 1 + "";
                        Notes.refreshTitleLists();
                    }
                }
                else{
                }
            }
            // Click the next button
            else if(this == $('a#pageIcon')[4]){

                if(pages > 3){
                    if((Notes.currentPageBase + 3) <  pages){
                        // refresh the page number after clicking the next button
                        Notes.currentPageBase++;
                        $('a#pageIcon')[1].innerText = parseInt($('a#pageIcon')[1].text) + 1 + "";
                        $('a#pageIcon')[2].innerText = parseInt($('a#pageIcon')[2].text) + 1 + "";
                        $('a#pageIcon')[3].innerText = parseInt($('a#pageIcon')[3].text) + 1 + "";
                        Notes.refreshTitleLists();
                    }
                }
            }
            else{

                // Get the page displacement
                if(this == $('a#pageIcon')[2])
                    Notes.pageDisplacement = 1;
                else if(this == $('a#pageIcon')[3])
                    Notes.pageDisplacement = 2;
                else
                    Notes.pageDisplacement = 0;

                if(this.text != ".."){
                    // refresh the title list
                    Notes.refreshTitleLists();

                    // Set the background color for current page
                    for(var i = 0; i < 3; i++)
                        if(Notes.pageDisplacement == i)
                            $($('a#pageIcon')[i + 1]).css('background-color','#EEEEEE');
                        else
                            $($('a#pageIcon')[i + 1]).css('background-color','#FFFFFF');
                }
            }
        });
        /*$($('a#pageIcon')[0]).click(function(){

         alert('NextPage');
         });

         $($('a#pageIcon')[5]).click(function(){

         alert('NextPage');
         });*/
    },

	// Refresh the title List
	refreshTitleLists: function(){

		// Delete all the nodes
		$('a#item').remove();

		// Create the new node
		title = '<a href="#" class="list-group-item" id="item">'+ title + '</a>';

		this.db.transaction(function(ts){
			ts.executeSql('select * from Notes order by id desc limit ?,10', [(Notes.currentPageBase + Notes.pageDisplacement)*10], function(ts, result){

                // Construct the title name used to display
                var titleDisplay;

				// fill the nodes
				for(var currentRow = 0; currentRow < result.rows.length; currentRow++){

                    titleDisplay = result.rows.item(currentRow).title;
                    if(titleDisplay.length > 20)
                        titleDisplay = titleDisplay.substr(0,20)+"...";

					title = '<a href="#" class="list-group-item" id="item">'+ titleDisplay + '</a>';
					$("#titleList").append(title);					
				}	

				// refresh the page icon
				// Notes.refreshPageIcon();

				// register the click event
				Notes.registerItemClickEvent();


                Notes.currentIndex = -1;

                $('#title').text('Add The Title');
                $('#title').css('color','#DCDCDC');
                $('#textEditor').text('Add The Content');
                $('#textEditor').css('color','#DCDCDC');

				// set the backgroud of the currently edit item
				//$($('a#item')[Notes.currentIndex]).css('background-color','#428BCA');
			},
			function(ts, error){
				alert(error);
			});
		});
	},

	// Choose the item
	chooseItem: function(item, collection){

		// Find the index of the selected item and highlight it
		var index  = Notes.getItemIndex(item, collection);
			if(Notes.currentIndex != index){
				$(collection[Notes.currentIndex]).css('background-color','#FFFFFF');
				$(item).css('background-color','#428BCA');
				Notes.currentIndex = index;
		}
		// Get the id of the select item and fill the content of the current item
		this.db.transaction(function(ts){
			ts.executeSql('select * from Notes order by id desc limit ?,1', [Notes.currentIndex + (Notes.currentPageBase + Notes.pageDisplacement) * 10], function(ts, result){

				// display the title and content of the selected item
				$('#title').text(result.rows.item(0).title);
				$('#title').css('color','#000000');	
				$('#textEditor').text(result.rows.item(0).content);
				$('#textEditor').css('color','#000000');	

				// record the id of the selected item
				Notes.currentEditItemId = result.rows.item(0).id;
			},
			function(ts, error){
				alert(error);
			});
		});
	},

	// get the index of the item in the title List
	getItemIndex: function(item, collection){
		for(var i = 0; i < collection.length; i++)
			if(item == collection[i])
				return i;
	},

	// register the note item click event
	registerItemClickEvent: function(){
		$('a#item').click(function(){
			Notes.chooseItem(this, $('a#item'));
		});
	}, 

	// reSet the interface
	reSetInterface: function(){
		this.currentIndex = -1;
		this.currentPageBase = 0;
		$('#title').text('Add The Title');
		$('#title').css('color','#DCDCDC');
		$('#textEditor').text('Add The Content');
		$('#textEditor').css('color','#DCDCDC');
	}
}
