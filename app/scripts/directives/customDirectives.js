'use strict';
/*global _:false */
/*global $:false */

angular.module('ldApp').directive('draggable', function() {
  var ddo = {
    link: function(scope,iElement,iAttrs) {
      $(iElement).draggable({
        snap:true,
        grid:[20,20]
      });

    }
  };
  return ddo;
});
angular.module('ldApp').directive('resizable', function() {
  var ddo = {
    link: function(scope,iElement,iAttrs) {
      $(iElement).resizable({

        grid:[20,20]
      });

    }
  };
  return ddo;
});
angular.module('ldApp').directive('editable',['command',function(command){
  var selected = [];
  var instInputBig=$('#instInputBig');
  var content;
  var rootScope;
  var editing;
  var data;
  var bytesNew;
  function processBig(){
    var bytes;
    var rawStringCommand='';
    if (editing === 'raw') {
      var memlines = _.pluck(selected,'memraw');
      bytes=/\w.*\w/.exec(memlines.join('\n').replace(/\n/g,' '))[0].match(/\w{2}/g);

      bytesNew = /\w.*\w/.exec(instInputBig.val().replace(/\n/g,' '))[0].match(/\w{2}/g);
      if(bytes.length< bytesNew.length){
        //alert('no space for extra bytes');
      }else{
        var reversed = _.map(/\w.*\w/.exec(instInputBig.val().replace(/\n/g,' '))[0].match(/\w{2}/g),function(v,i,l){
          return l[l.length-i-1];
        }).join('');


        rawStringCommand = 'set {char[' +
                            bytesNew.length +
                            ']}'+
                            selected[0].address  +
                            '=0x' + reversed
                            ;
        command.commandExecO({
          ptyPayload:rawStringCommand
        });
        data.debugData.getDissasembly();
        data.debugData.infoBreakpoints();
      }
    }else{

    }
  }
  function process(){

  }
  $(window).keyup(function(e){
    if(e.which===13){
      if(selected.length>0){
        if(e.shiftKey){
          editing = 'raw';
          var memlines = _.pluck(selected,'memraw');
          content=memlines.join('\n');
          instInputBig.attr({
            rows:memlines.length
          });
          instInputBig.val(content);
          instInputBig.css({
            position:'absolute',
            left: selected[0].leftmr,
            top: selected[0].topmr,
          });
          instInputBig.show();

          instInputBig.focus();
        }else{
          editing = 'op';
          var opcodes = _.pluck(selected,'opcode');
          var operands = _.pluck(selected,'operands');
          var instructions = _.zip(opcodes,operands).map(function(v){
            return v.join(' ');
          });
          content=instructions.join('\n');
          instInputBig.attr({
            rows:instructions.length
          });
          instInputBig.val(content);
          instInputBig.css({

            position:'absolute',
            left: selected[0].leftop+'px',
            top: selected[0].topop+'px',
          });
          instInputBig.show();
          instInputBig.focus();
        }
      }
    }
  });
  instInputBig.keyup(function(e) {
    e.stopPropagation();
    if(e.which === 13 && e.ctrlKey) {
      processBig(content);
      instInputBig.hide();
      _.each(selected,function(v){
        v.selected=false;
      });

      selected=[];
      rootScope.$apply();
    }
    if(e.which === 27) {
      //$scope.process($scope.content);
      instInputBig.hide();
      content='';
      _.each(selected,function(v){
        v.selected=false;
      });
      selected=[];
      rootScope.$apply();
    }

  });

  $('#instInput').keyup(function(e) {
    e.stopPropagation();
    if(e.which === 13) {
      process(content);
      $('#instInput').hide();
    }
    if(e.which === 27) {
      //$scope.process($scope.content);
      $('#instInput').hide();
    }

  });
  var ddo = {
    scope:true,
    // replace:true,
    //transclude:true,
    //template:$('#editTemplate').html(),
    controller: function dcOnt($scope, $element,$attrs, $transclude,$rootScope, $compile,Data,$controller) {
      //fix inject dependency on declaration level
      data=Data;
      rootScope=$rootScope;
      $scope.mode = 'display';
      $scope.process = function(content){
        console.log($attrs);
        Data.debugData.patch($scope.thing);
        console.log('console edited',content);
      };



    },
    link: function lf(scope,iElement,iAttrs) {
      var offset = $(iElement).offset();
      if(iAttrs.editable==='raw'){
        scope.thing.leftmr = offset.left;
        scope.thing.topmr = offset.top;
      }else{
        scope.thing.leftop = offset.left;
        scope.thing.topop = offset.top;
      }

      $(iElement).click(function(){
        selected.push(scope.thing);
        scope.thing.selected=!scope.thing.selected;
        if (!scope.thing.selected) {
          selected = _.without(selected,scope.thing);
        }
        selected = _.sortBy(selected,'topmr');
        scope.$apply();
      });
      $(iElement).dblclick(function(){
        scope.mode = 'edit';
        scope.content=$(iElement).html();
        $('#instInput').val(scope.content);
        var offset = $(iElement).position();
        $('#instInput').offset({
          left: offset.left,
          top: offset.top,
        });
        $('#instInput').show();

      });
    }
  };
  return ddo;
}]);
angular.module('ldApp').directive('commandwind',function() {
  var ddo = {
    scope:{},
    template: $('#commandWindT').html(),
    controller: function dcOnt(configState,$scope, $element,$attrs, $transclude,$rootScope, $compile,Data,$controller,command) {
      //var Data = $injector.get("Data");
     // dcOnt.$new=function(){};
      $scope.sendCommand=function(cmd){
        if(configState.recording){
          configState.record.push('s ' + cmd);
        }
        command.commandExecO({
          ptyPayload:cmd,
          callback:function(result){
            $scope.things=result;
            $scope.$apply();
          }
        });
      };
      $scope.clone = function() {
        var html = '<div commandWind draggable resizable > </div>';
        var template = angular.element(html);
        // var elt= $element.parent().append(template);
        var linkFn = $compile(template);
        //var nscope ={$n,$parent:$scope.$parent};
        //dcOnt(nscope,template,$compile,Data,$controller);
        var el = linkFn($rootScope.$new() ,function(clonedEl,scope){
          var e=$element.parent().append(clonedEl);
          $(clonedEl).css({
            width:'300px',
            height:'100px',
            color:'#ff0000',
            background:'rgba(00,00,24,0.2)',
            position:'absolute',
          });
        });
        //$scope.$apply();
      };
      $scope.destroy = function() {
        //$element.$destroy();
        $element.remove();
      };
    },
    link: function lf(scope,iElement,iAttrs) {
      $(iElement).css({
        width:'300px',
        height:'100px',
        color:'#ff0000',
        position:'absolute',
        background:'rgba(00,00,24,0.02)',
      });
    }
  };
  return ddo;
});
angular.module('ldApp').directive('wind',['jsX',function(jsX){
  var windF = null;
  var ddo = {
    priority:99,
    template: $('#decoratorWind').html(),
    transclude:true,
    controller: function dcOnt(configState,$scope, $element,$attrs, $transclude,$rootScope, $compile,Data,$controller,command) {
      configState.bWindows[configState.bWindows.length-1].container=$element;
      $scope.close = function(){
        $element.remove()
      }
      $scope.minimize = function(){
        $element.toggle();
      }
    },
    link:  function postLink(scope,iElement,iAttrs,$compile) {
      if(windF === null){
        windF = jsX.module();
      }
      
      windF({
        content:iElement
        //,
        //  decorator:$(iElement).find('.windContent')[0]
      })
      
    }
  };
  return ddo;
}]);
angular.module('ldApp').directive('beditor',['command','state','ace','beeScript','store',function(command,state,aceS,beeScriptS,store) {

  var ddo = {
    scope:{},
    restrict:'E',
    priority:999,
    template: $('#newScriptWT').html(),
    controller: function dcOnt(configState,$scope, $element,$attrs, $transclude,$rootScope, $compile,Data,$controller,command) {
      var beeScript = beeScriptS.beeScript;
      beeScript.runner.diskotekLib.command=command.commandExecO;
      beeScript.runner.diskotekLib.state = state;
      beeScript.runner.diskotekLib.$rootScope=$rootScope;
      beeScript.runner.variables.fImage = { name: 'fImage',
                                            value: Data.disassemblyData
                                          };
      $scope.running=false;
      $scope.dirty=false;
      $scope.scriptOutput;
      $scope.windowObj=configState.bWindows[configState.bWindows.length-1];
      $scope.contents=configState.bWindows[configState.bWindows.length-1].contents;
      $scope.newScriptSaveShow = false;
      $scope.newScriptSaveControlsToggle = function(){
        $scope.newScriptSaveShow= !$scope.newScriptSaveShow;
      };

      $scope.newScriptName='';
      $scope.newScriptDesc='';
      $scope.$watch('newScriptName',function(n,old){
        if (store.store.get(n)){
          store.store.remove(old);
        }else{
          store.store.remove(old);
          var scriptO ={
            scriptName:$scope.newScriptName,
            scriptDescription:$scope.newScriptDesc,
            scriptContent:$scope.contents
          };

          store.store.set($scope.newScriptName,scriptO);
        }
      });
      $scope.$watch('newScriptDesc',function(n,old){


        var scriptO ={
          scriptName:$scope.newScriptName,
          scriptDescription:$scope.newScriptDesc,
          scriptContent:$scope.contents
        };

        store.store.set($scope.newScriptName,scriptO);
      });
      $scope.$watch('contents',function(n,old){
        var scriptO ={
          scriptName:$scope.newScriptName,
          scriptDescription:$scope.newScriptDesc,
          scriptContent:$scope.contents
        };

        store.store.set($scope.newScriptName,scriptO);
      });
      $scope.save = function(){

      };
      $scope.run = function(){

      };
      $scope.stepOver = function(){
        if (!$scope.dirty){
          beeScript.runner.next();
        }else{
          beeScript.text = $scope.editor.getValue();
          beeScript.reset();
          beeScript.runner.diskotekLib.command=command.commandExecO;
          beeScript.runner.diskotekLib.state = state;

          beeScript.runner.diskotekLib.$rootScope=$rootScope;
          beeScript.runner.variables.fImage = { name: 'fImage',
            value: Data.disassemblyData
          };
          beeScript.generate();

          beeScript.next();
          $scope.running=true;
          $scope.dirty=false;
        }
      };
      $scope.stepInto = function(){

      };
      $scope.close = function(){

      };
      //var Data = $injector.get("Data");
     // ,
      // dcOnt.$new=function(){};
      $scope.sendCommand=function(cmd){
        command.commandExecO({
          ptyPayload:cmd,
          callback:function(result){
            $scope.things=result;
            $scope.$apply();
          }
        });

      };
      $scope.destroy = function() {
        //$element.$destroy();
        $element.remove();
      };
    },
    link:  function postLink(scope,iElement,iAttrs,$compile) {
      var ace = aceS.ace;
      var editEl=$(iElement).find('.scriptEditor')[0];
      var editor = scope.editor = ace.edit(editEl);
      editor.setTheme('ace/theme/monokai');
      editor.getSession().setMode('ace/mode/beeScript');
      editor.setValue(scope.contents=scope.windowObj.contents);
      editor.getSession().on('change', function(e) {
        // e.type, etc
        scope.windowObj.contents=scope.contents=editor.getValue();
        scope.dirty=true;
        scope.$digest();
      });
      $(editEl).on('mousemove',function(e){
        e.stopPropagation();
      });

    }
  };
  return ddo;
}]);


function Module(x,y,module){
  this.x=x;
  this.y=y;
  this.width=100;
  this.height=200;
  this.fileHeaderHeight = 50;
  this.render = function(){
    var file = s.rect(this.x,this.y,this.width,this.fileHeaderHeight);
    file.attr({fill:'#00FF00'});

    var fHeader = s.rect(this.x,this.y+50,this.width,this.height);
    fHeader.attr({fill:'#FF0000'});

  }

}

/*




window.s.remove();
var s = window.s = Snap();

file = {
  fileHeader:{},
  programHeaders:[{},{}],
};
module = {

};
a = new File(50,50,file);
b = new Module(200,50,module);
a.render();
b.render();



  */



