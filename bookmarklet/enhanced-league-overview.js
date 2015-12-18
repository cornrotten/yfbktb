javascript: (function(){
    var jssrc = document.createElement('script');
    jssrc.setAttribute("type","text/javascript");
    jssrc.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js");
    document.getElementsByTagName("head")[0].appendChild(jssrc);
    
    var hdl = {
        leaveoutIrrelevants: function() {
            jQuery('.Rail .RailSub').parent().remove();    
            jQuery('.Rail .RailMain').css({width: '950px'});    
            jQuery('#fantasyhero').remove();        
            jQuery('#transactions').remove();        
            jQuery('#messages').remove();        
            jQuery('#commishupdates').remove();       
            jQuery('#home-fantasy-experts').remove();           
            jQuery("#mgrTimeTableCont").remove();    
            jQuery("<div/>").attr("id", "mgrTimeTableCont").appendTo(jQuery('.Rail .RailMain'));  
        },
        
        attachAdditionalInfo: function() {
            hdl.leaveoutIrrelevants();
            jQuery('.Tst-manager > :first-child').each(function(){        
                hdl.handleMgrOneByOne.call(this);
            });
        },

        handleMgrOneByOne: function() {
            var url = jQuery(this).attr('href');        
            var avatar = jQuery(this).find('img').clone();
            var mgrName = jQuery(this).next().text();        
            jQuery.ajax({            
                url: url + "?stat1=O&ajaxrequest=1"        
            }).done(function(data){           
                hdl.onTimetableStatCallback(data, url, avatar, mgrName);
            });
        },
        
        onTimetableStatCallback: function(data, url, avatar, mgrName) {
            var cont = jQuery("<div/>");            
            cont.attr("mgrKey", url).appendTo(jQuery("#mgrTimeTableCont"));            
            jQuery(data.content).appendTo(cont);            
            setTimeout(function(){                                
                hdl.renderTimetable(cont, url, avatar, mgrName);
            }, 40);
        },
        
        renderTimetable: function(cont, url, avatar, mgrName) {
            cont.find("section header .Ptop-xs").remove();                
            cont.find("section #dnd-status").remove();                
            cont.find("section #buttonbar").remove();                
            cont.find("section header .Grid-table .Ta-end").children().remove();
            cont.find("section .stat-target .ysf-rosterswapper thead .First").remove();                               
            avatar.appendTo(cont.find("section header .Grid-table .Ta-end"));                
            jQuery("<span>" + mgrName + "</span>").appendTo(cont.find("section header .Grid-table .Ta-end"));                                
            var removedIdxMap = {}, titleMap = {}, curtIdx = 0;                
            cont.find("section .stat-target .ysf-rosterswapper thead tr th").each(function(){                   
                var title = jQuery(this).text();                  
                if(title == "Action" || title == "Opp" || title == "Status" || title == "Edit") {                        
                    removedIdxMap["k"+curtIdx] = curtIdx;                  
                    if(title == "Action") {                            
                        curtIdx++;                            
                        removedIdxMap["k"+curtIdx] = curtIdx;                        
                    }                        
                    jQuery(this).remove();                    
                }           
                titleMap["k"+curtIdx] = title;             
                curtIdx++;                
            });                                
            var cntByDay = {}, numOfAtts = 0, curtDayIdx = 0, maxStartingLineup = 0;                
            cont.find("section .stat-target .ysf-rosterswapper tbody tr").each(function(){                                        
                var bdrendCnt = 0, isFutureDay = false, position = "";                    
                jQuery(this).find('td').each(function(idx){                        
                    if(idx == 0) {                            
                        position = jQuery(this).text();
                        if(position != 'BN' && position != 'IL') {
                            maxStartingLineup++;
                        }                        
                    }                                                
                    if(removedIdxMap["k"+idx]) {                            
                        jQuery(this).remove();                            
                        return true;                        
                    }                        
                    if(isFutureDay == false) {                            
                        isFutureDay = jQuery(this).hasClass('Selected');  
                        curtDayIdx = idx;
                    }                        
                    bdrendCnt += (jQuery(this).hasClass('Bdrend') ? 1 : 0);                        
                    if(bdrendCnt < 2 || bdrendCnt > 3 || position == "IL" || jQuery(this).hasClass('player')) {                            
                        return true;                        
                    }                        
                    var kprefix = isFutureDay ? "f" : "k";                        
                    var cnt = cntByDay[kprefix+idx] || 0;                        
                    cnt = jQuery(this).text() == "" ? cnt : cnt+1;                        
                    if(cnt > maxStartingLineup) {                            
                        cnt = maxStartingLineup;                 
                    }                        
                    cntByDay[kprefix+idx] = cnt;                                                                        
                    if(bdrendCnt == 3) {                            
                        return false;                        
                    }                    
                });                                    
            });                
            var estFTot = 0, totCnt = 0;  
            var estDetailArr = [];
            for(var key in cntByDay) {   
                totCnt += cntByDay[key] || 0;
                if(key.indexOf("f") == 0) {
                    estFTot += cntByDay[key] || 0;
                } 
                estDetailArr.push(key);                
            }
            var tgtEl = jQuery("#matchupweek .F-link[href='" + url + "']");
            var pointCont = tgtEl.parent().parent().parent().parent().prev();
            pointCont.css({'width': '70px'});
            pointCont.children().css({'padding-right': '8px'});
            pointCont.parent().parent().css({'padding-bottom': '1px'});
            
            tgtEl.parent().next().remove();                        
            tgtEl.parent().css({'max-width': '300px'});
            tgtEl.parent().find('.est-ftot').remove();             
            tgtEl.parent().find('.est-details').remove();      
            jQuery("<span class=\"est-ftot\">(est. " + estFTot + ")</span>").appendTo(tgtEl.parent());             
            
            var detailCont = jQuery('<div style="font-size: 13px;" class="est-details" />');
            detailCont.appendTo(tgtEl.parent());
            
            var detailTb = jQuery('<table style="border: 1px solid black;" />');
            detailTb.appendTo(detailCont);
            
            var titleTdArr = [], cntByDayTdArr = [], runningTotTdArr = [];
            var runningTot = 0, remainingTot = totCnt, tmpDayCnt = 0;
            var tdStyle = 'border: 1px solid black; padding: 2px 3px; text-align: center;';
            for(var i=0; i<estDetailArr.length; i++) { 
                var curtIdxStr = estDetailArr[i].substr(1);
                tmpDayCnt = cntByDay[estDetailArr[i]];
                runningTot += tmpDayCnt;
                remainingTot -= tmpDayCnt;
                titleTdArr.push('<td colspan="2" style="' + tdStyle + 
                        (parseInt(curtIdxStr, 10) == curtDayIdx ? 'background-color: #e7e7e7;' : '') + '">' + titleMap['k'+curtIdxStr] + '</td>');
                cntByDayTdArr.push('<td colspan="2" style="' + tdStyle + '">' + tmpDayCnt + '</td>');
                runningTotTdArr.push('<td style="' + tdStyle + '">' + runningTot + '</td>');
                runningTotTdArr.push('<td style="' + tdStyle + '">' + remainingTot + '</td>');
            }
            jQuery('<thead><tr>' + titleTdArr.join('') + '</tr></thead>').appendTo(detailTb);
            jQuery('<tbody><tr>' + cntByDayTdArr.join('') + '</tr><tr>' + runningTotTdArr.join('') + '</tr></tbody>').appendTo(detailTb);
        }
    };
    
    setTimeout(function(){    
        hdl.attachAdditionalInfo();        
    }, 400);
})();
