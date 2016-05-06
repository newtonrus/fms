// 040516

var is_fast_check = true,	
	sound_obj, audio_obj = new Audio("http://wav-library.net/effect/alarm/mayak.mp3"),
	is_checked, timer_id, $els_arr, serialize_data,
	timer_counter = 0, timer_delay, timer_last; 
	
timer_delay = is_fast_check ? 1500 : 2000;
audio_obj.play();
	
var start_get = function (el) {
		$("#step-2").children(".e-formstep").toggle(!!timer_id);
		$("#step-3").children(".e-formstep").toggle(!!timer_id);	
		
		if (!sound_obj) sound_obj = $("#sound_obj")[0];
		
		is_checked = true;
 					
		if (timer_id) {
			clearTimeout(timer_id);
			timer_id = timer_counter = serialize_data = 0;			
		} else {
			serialize_data = $("#appointment_form").serialize();
			timer_id = setTimeout(function timer_func () {
				var now_time = new Date().getTime();
				if (is_checked || (now_time - timer_last) < 180000) {				
					timer_counter += 1;							
					timer_last = now_time;
					check_ajax(el);
				}
				timer_id = setTimeout(timer_func, timer_delay, el);
			}, timer_delay, el);
		}	
	},	
	check_dates = function (is_test) {
		var start_date = new Date (),
			max_date = new Date (),
			result_arr = [];
		
		max_date.setDate(max_date.getDate() + 15);
		
		if (!is_test) is_test = "20";
		
		var scheduleEdge = Date.parse("2016-12-31 00:00:00"),
			emptyDays = document["app_emptydays_" + is_test],
			i_days, i_result;
			
		for (i_days = 0; i_days < 15; i_days++) {			
			start_date.setDate(start_date.getDate() + 1);			
	
			var formatted = $.datepicker.formatDate("dd.mm.yy", start_date);
			var timestamp = $.datepicker.formatDate("@", start_date);
			var dateNow = timestamp / 1000;
			var dow = start_date.getDay();
			var dateKey = "";    
			
			for (var key in emptyDays) {
				var dateTo = emptyDays[key]["to"] + 7200;
				var dateFrom = parseInt(key) - 7200;

				if (dateFrom <= dateNow && dateTo >= dateNow) {
					dateKey = key;
					break;
				}
			}

			if (!dateKey) i_result = [false, "", "Время недоступно для записи"];
			else if (timestamp <= new Date().getTime() || timestamp > scheduleEdge) i_result = [false, "", "Время недоступно для записи"];
			else if (start_date.getTime() > max_date.getTime()) i_result = [false, "", "Время недоступно для записи"];
			else if (document["app_emptydays_" + is_test][dateKey]["data"].indexOf(dow) != -1) i_result = [false, "", "Время недоступно для записи"];
			else if (document["app_playdays_" + is_test][dateKey]["data"].indexOf(formatted) != -1) i_result = [false, "", "Время недоступно для записи"];
			else if (document["app_busydays_" + is_test][dateKey]["data"].indexOf(formatted) != -1) i_result = [false, "busyday", "Время для записи исчерпано"];
			else if (document["app_shortdays_" + is_test][dateKey]["data"].indexOf(formatted) != -1) i_result = [true, "normalday", "Короткий день"];
			else i_result = [true, "normalday", "Время доступно для записи"];			
			
			if (i_result[0]) return [formatted, i_result];
			
			result_arr.push(i_result);
		}
		
		result_arr.push(timer_counter);
		
		AAWWWQQ = result_arr;              
	},
	check_ajax = function (el) {	
		$("#step-4").html("");
		
		is_checked = false;
		
		if (!$els_arr) $els_arr = [
			$("#step-4"),
			$(".ui-datepicker-calendar")
		];		
		
		$.ajax({
			url: "/services/appointment/appointment_schedule_view/",
			type: "get",
			data: serialize_data, 
			dataType: "html",
			success: function (data) {														
				document.title = timer_counter;			
				
				var dates_arr;
				if (is_test.is_test) dates_arr = /(document.app_emptydays_89.+)varinfoCreated/.exec(data.replace(/[ \n]+/g, ""));
				else dates_arr = /(document.app_emptydays_20.+)varinfoCreated/.exec(data.replace(/[ \n]+/g, ""));
				
				$els_arr[0].html($('<script type=' + '"text/javascript">' + dates_arr[1] + '</' + 'script>'));
				
				dates_arr = check_dates(is_test.is_test);				
				if (dates_arr) {
					sound_obj.play();
					$("#service_block").prepend(dates_arr.join());
				}								
				
				is_checked = true;
				
				if (is_fast_check && !dates_arr) return;				
				
				$els_arr[0].html($(data));							
										
				$('#schedule_block').children(".cf-item").children(".cf-item-input").children("label").click();
				$(".input-ico_right").click();	
				$(".ui-datepicker-next").click();	
			
				//$(".ui-datepicker-calendar .normalday:first").click();								
				
				if (!is_fast_check && !$(".ui-datepicker-calendar .normalday:first")[0]) return;								
				
				var today = new Date();
				
				clearTimeout(timer_id);
				timer_id = timer_counter = serialize_data = 0;		
				
				sound_obj.play();				
				document.title = timer_counter + "!!!YES!!!" + today.toString();
				// alert("!!!YES!!!");									
				
				// $("#ui-datepicker-div").append($(el).clone());						
				
				$("[name='lastname']").val("");
				$("[name='firstname']").val("");
				$("[name='patronymic']").val("");
				$("[name='pdocnumber']").val("4162331");
				$("[name='address']").val("");
				$("[name='phone']").val("");
				$("[name='email']").val("");		  			
			}
		});		
	},
	is_test = function (el) {
		serialize_data = "site_id=2&select=&district_id=&select=&document_id=362&select=&operation_id=165&select=&time=&date=&lastname=&firstname=&patronymic=&pdocnumber=&address=&phone=&email=&captcha=";;	
		is_test.is_test = !is_test.is_test;
		if (is_test.is_test) is_test.is_test = "89";
	},
	fast_get = function (el) {
		is_fast_check=!is_fast_check;		
	};

$("#service_block").prepend('<div onclick="start_get(this);" style="background:yellow;cursor:pointer;">GET!</div>');
$("#service_block").prepend('<div onclick="fast_get(this)" style="background:green;cursor:pointer;">FAST!</div>');
$("#service_block").prepend('<div onclick="is_test(this)" style="background:silver;cursor:pointer;">TEST!</div>');
$("#service_block").prepend('<audio id="sound_obj" src="http://wav-library.net/effect/alarm/mayak.mp3" preload="auto" controls loop></audio>');

// debugger;