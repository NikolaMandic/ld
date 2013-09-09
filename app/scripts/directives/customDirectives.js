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
angular.module('ldApp').directive('commandwind',function() {
  var ddo = {
    scope:{},
    template: '<div ><div>commandPanel</div><div><input type="text" size="10" ng-model="command"> <a ng-click="sendCommand(command)">sendCommand</a>&nbsp<a ng-click="clone()">new</a>&nbsp<a ng-click="destroy()">X</a></div> <div ng-repeat="thing in things">{{thing}}</div> </div>',
    controller: function dcOnt($scope, $element,$attrs, $transclude,$rootScope, $compile,Data,$controller) {
      //var Data = $injector.get("Data");
     // dcOnt.$new=function(){};
      $scope.sendCommand=function(command){
        Data.commandExecL(command,function(){
          $scope.things=Data.sharedData.result;
        });
      }
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
        background:"rgba(00,00,24,0.2)",
         position:"absolute",
      
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
        position:"absolute",
        background:"rgba(00,00,24,0.02)",
      });
    }
  };
  return ddo;
});
