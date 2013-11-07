// Generated by CoffeeScript 1.6.3
(function() {
  angular.module('ldApp').factory('state', [
    'command', 'configState', 'DataDisassemblyParsers', 'Data', function(command, configState, parsers, data) {
      var TLBEntrySize, state;
      TLBEntrySize = configState.TLBEntrySize;
      return state = {
        registers: {
          '': ''
        },
        data: data,
        memory: {
          /*
          */

          TLB: {}
        },
        getMemory: function(addr) {
          var c, r, _ref;
          if (state.memory.TLB[addr >>> TLBEntrySize] != null) {
            c = state.memory.TLB[addr >>> TLBEntrySize].content;
            r = (_ref = _.where(c.content, {
              'address': addr
            })) != null ? _ref[0] : void 0;
            return r;
          } else {
            return command.commandExecO(configState.getMemoryCommand(addr)).then(function(contentPulled) {
              return state.memory.TLB[addr >>> TLBEntrySize] = {
                content: parsers[configState.architecture].disassemblyParser(contentPulled).instructions,
                dirty: 0
              };
            });
          }
        }
      };
    }
  ]);

}).call(this);
