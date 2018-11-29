javascript: (function(){
    var jssrc = document.createElement('script');
    jssrc.setAttribute("type","text/javascript");
    jssrc.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js");
    document.getElementsByTagName("head")[0].appendChild(jssrc);

    var hdl = {
        NUM_OF_USRS: 10,
        RANKING_THRESHOLD: 10,
        
        calc: function() {
            for(var usrId = 1; usrId <=hdl.NUM_OF_USRS; usrId++) {                           
                var cont = jQuery('#usrCont'+usrId);
                var usrNameTd = cont.find('#players-table .players table tbody tr:nth-child(1) td:nth-child(6)');
                console.log('usrName: ', usrNameTd.text());
                var totMeanFanPts = 0;
                cont.find('#players-table .players table tbody tr td:nth-child(8)').each(function(idx){                    
                    if(idx >= hdl.RANKING_THRESHOLD) {
                        return false;
                    }
                    var meanFanPtsTd = jQuery(this);
                    var meanFanPts = parseFloat(meanFanPtsTd.text());
                    totMeanFanPts += meanFanPts;
                    console.log('ranking: ', idx+1, ', meanFanPts: ', meanFanPts);                    
                });
                var avg = Number(Math.round((totMeanFanPts/hdl.RANKING_THRESHOLD)+'e2')+'e-2');
                console.log('totMeanFanPts: ', totMeanFanPts, ', avg: ', avg);
                
                jQuery('<div />').text(usrNameTd.text() + ', ' + avg).appendTo(jQuery('#usrsSummaryCont'));
            }
        },
        
        leaveoutIrrelevants: function() {
            jQuery('.Rail .RailSub').parent().remove();
            jQuery('.Rail .RailMain').css({width: '950px'});
            jQuery('#fantasyhero').remove();
            jQuery('#transactions').remove();
            jQuery('#messages').remove();
            jQuery('#commishupdates').remove();
            jQuery('#home-fantasy-experts').remove();
            jQuery("#usrsCont").remove();
            jQuery("#usrsSummaryCont").remove();
            jQuery("<div/>").attr("id", "usrsSummaryCont").appendTo(jQuery('.Rail .RailMain'));
            jQuery("<div/>").attr("id", "usrsCont").appendTo(jQuery('.Rail .RailMain'));            
        },
        
        process: function() {
            hdl.leaveoutIrrelevants();            
            
            for(var usrId = 1; usrId <=hdl.NUM_OF_USRS; usrId++) {                           
                var cont = jQuery('<div/>').attr('id', 'usrCont'+usrId).appendTo(jQuery('#usrsCont'));
                jQuery.ajax({
                    async: false,
                    url: window.location.href + "/players?status=" + usrId + "&pos=P&stat1=S_AS_2018&myteam=0&sort=PTS&sdir=1&ajaxrequest=1"
                }).done(function(data){                    
                    jQuery(data.content).appendTo(cont);
                });
            }
            setTimeout(function(){
                $('#usrsCont section.Mod.Thm-inherit.No-mend #playersearch,#usrsCont section.Mod.Thm-inherit.No-mend #playerfilter').remove();
                hdl.calc();
            }, 400);
        }
    };

    setTimeout(function(){
        hdl.process();
    }, 400);
})();
