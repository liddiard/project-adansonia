(function(){
    var app = angular.module('notes', []);

    app.controller('NotesController', function($http, $scope) {
        var form = this;
        this.major_tree = [];
        this.minor_tree = [];

        this.noteFromPath = function(path) {
            var note = form.major_tree;
            for (var i = 0; i < path.length-1; i++) {
                note = note[path[i]];
            }
            return note;
        }

        this.applyDiff = function(diff) {
            for (var i = 0; i < diff.length; i++) {
                if (diff[i].path[diff[i].path.length-1] === "$$hashKey")
                    continue;
                else if (diff[i].kind === 'E') {
                    var note = form.noteFromPath(diff[i].path);
                    $http({
                        method: 'POST',
                        url: '/api/note/update/',
                        data: $.param({id: note.id, text: note.text}),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    });
                }
            }
        }

        $http.get('/api/note/major-pane/').success(function(data){
            form.major_tree = data;

            /* listen for changes in notes */
            $scope.$watch(
                function() { return form.major_tree },
                function(newValue, oldValue) {
                    var diff = DeepDiff(oldValue, newValue);
                    if (diff)
                        form.applyDiff(diff);
                },
                true // objectEquality
            );
        });
    });
})();
