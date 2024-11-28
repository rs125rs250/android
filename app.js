/*
 * app.js: simple BLE connect application
 *
 * This application uses Web Bluetooth API.
 * Supporting OS and browsers are listed in the link below.
 * https://github.com/WebBluetoothCG/web-bluetooth/blob/master/implementation-status.md
 */

const textDeviceName = document.getElementById('textDeviceName');
const textUniqueName = document.getElementById('textUniqueName');
const textDateTime = document.getElementById('textDateTime');
const textVal1 = document.getElementById('textVal1');
const textVal2 = document.getElementById('textVal2');
const textVal3 = document.getElementById('textVal3');
const textVal4 = document.getElementById('textVal4');
// const textVal5 = document.getElementById('textVal5');
// const textVal6 = document.getElementById('textVal6');

const buttonConnect = document.getElementById('ble-connect-button');
const buttonDisconnect = document.getElementById('ble-disconnect-button');
const buttonLedPls = document.getElementById('button-led-pls');
const buttonLedMns = document.getElementById('button-led-mns');
const buttonDownload = document.getElementById("button-download");

let leafony;

// array of received data
let savedData = [];
// length of savedData
const CSV_BUFF_LEN = 1024;

// Chart
let ctx = document.getElementById('myChart').getContext('2d');
let config = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Sensor1',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: [],
        }],
    },
    options: {
		maintainAspectRatio: false,
		responsive: true,
		title: {
			display: false,
			text: '繧ｰ繝ｩ繝輔ち繧､繝医Ν'
		},
		tooltips: {
			mode: 'index',
			intersect: false,
		},
		hover: {
			mode: 'nearest',
			intersect: true,
		},
		scales: {
			xAxes: [{
				display: false,
				scaleLabel: {
					display: false,
					labelString: 'Time',
				},
			}],
			yAxes: [{
				display: true,
				scaleLabel: {
					display: true,
					labelString: 'Resistance [ohm]',
				}
			}]
		}
	}
};

let chart = new Chart(ctx, config);

window.onload = function () {

	clearTable();

};


buttonConnect.addEventListener( 'click', function () {

	leafony = new Leafony();
	leafony.onStateChange( function ( state ) {
		updateTable( state );
	} );



	leafony.connect();

	buttonConnect.style.display = 'none';
	buttonDisconnect.style.display = '';


} );


buttonDisconnect.addEventListener( 'click', function () {
	
	leafony.disconnect();
	leafony = null;	

	clearTable();
	buttonConnect.style.display = '';
	buttonDisconnect.style.display = 'none';

} );


function clearTable () {

	textDeviceName.innerHTML = '';
	textUniqueName.innerHTML = '';
	textDateTime.innerHTML = '';
	textVal1.innerHTML = '';
//	textVal2.innerHTML = '';
//	textVal3.innerHTML = '';
//	textVal4.innerHTML = '';
//	textVal5.innerHTML = '';
//	textVal6.innerHTML = '';

}


function updateTable ( state ) {
	let date = new Date();
	let year     = String( date.getFullYear() );
	let month    = ( '00' + ( date.getMonth() + 1 ) ).slice( -2 );
	let day      = ( '00' + date.getDate() ).slice( -2 );
	let hours    = ( '00' + date.getHours() ).slice( -2 );
	let minutes  = ( '00' + date.getMinutes() ).slice( -2 );
	let seconds  = ( '00' + date.getSeconds() ).slice( -2 );
	let datetime = year + '/' + month + '/' + day + ' ' + 
				   hours + ':' + minutes + ':' + seconds;
				   
	textDeviceName.innerText = state.devn;
	textUniqueName.innerText = state.unin;
	textDateTime.innerText = datetime;
	textVal1.innerText = state.val1;
//	textVal2.innerText = state.val2;
//	textVal3.innerText = state.val3;
//	textVal4.innerText = state.val4;
//	textVal5.innerText = state.val5;
//	textVal6.innerText = state.val6;

	// Create array of reveived data and sensors data
	let darray = new Array(
		datetime, 
		state.devn,
		state.unin,
		state.val1, 
		state.val2, 
		state.val3, 
		state.val4, 
		state.val5,
		state.val6);

	// stack reveived data up to CSV_BUFF_LEN
	if (savedData.length >= CSV_BUFF_LEN) {
		savedData.shift();
	}
	savedData.push( darray );

	// Append data to the chart
	config.data.labels.push(datetime);
	config.data.datasets.forEach(function(dataset){
		dataset.data.push(parseFloat(state.val1));
	});
	chart.update();
}


buttonLedPls.addEventListener ( 'click', function () {

	console.log( 'LED Plus Button Clicked' );
	leafony.sendCommand( 'PLS' );

});


buttonLedMns.addEventListener( 'click', function () {

	console.log( 'LED Minus Button Clicked' );
	leafony.sendCommand( 'MNS' );

});


buttonDownload.addEventListener( 'click', function () {

	let bom_utf_8 = new Uint8Array( [ 0xEF, 0xBB, 0xBF ] );
	let csvText = "";

	csvText += "Datetime,Device Name,Unique Name,Val1,Humid,Light,Tilt,BattVolt,Dice\n";
	// Write all received data in savedData
	for ( var i = 0; i < savedData.length; i++ ) {
		for ( var j = 0; j < savedData[i].length; j++ ) {
			csvText += savedData[i][j];
			if ( j == savedData[i].length - 1 ) csvText += "\n";
			else csvText += ",";
		}
	}

	let blob = new Blob( [ bom_utf_8, csvText ], { "type": "text/csv" } );

	let url = window.URL.createObjectURL( blob );

	let downloader = document.getElementById( "downloader" );
	downloader.download = "data.csv";
	downloader.href = url;
	$( "#downloader" )[0].click();

	delete csvText;
	delete blob;
});