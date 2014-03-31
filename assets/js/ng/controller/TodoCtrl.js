(function () {
	'use strict';

	function findIndex(data, arr) {
		for (var i in arr) {
			if (arr[i].id == data.id) {
				return i;
			}
		}
		return null;
	}

	//	TodoCtrl.$inject = ['$scope', 'sailsSocket', '$filter', '$location', '$log'];
	angular.module('todomvcApp').controller('TodoCtrl', ['$scope', 'sailsSocket', '$filter', '$location', '$log', TodoCtrl]);

	function TodoCtrl($scope, sailsSocket, $filter, $location, $log) {
		$scope.todos = [];
		$scope.newTodo = '';
		$scope.editedTodo = null;

		if ($location.path() === '') {
			$location.path('/');
		}

		$scope.location = $location;

		$scope.$watch('location.path()', function (path) {
			$scope.statusFilter = {
				'/active': {
					completed: false
				},
				'/completed': {
					completed: true
				}
			}[path];
		});

		$scope.$watch('todos', function () {
			$scope.remainingCount = $filter('filter')($scope.todos, {
				completed: false
			}).length;
			$scope.completedCount = $scope.todos.length - $scope.remainingCount;
			$scope.allChecked = !$scope.remainingCount;
		}, true);

		$scope.addTodo = function () {
			if ($scope.newTodo) {
				sailsSocket.post('/todo', {
					title: $scope.newTodo,
					completed: false
				});
				$scope.newTodo = '';
			}
		};

		$scope.removeTodo = function (todo) {
			sailsSocket.delete('/todo', todo);
		};

		$scope.updateTodo = function (todo) {
			sailsSocket.put('/todo', todo);
		};

		$scope.clearCompletedTodos = function () {
			angular.forEach($scope.todos, function (todo) {
				if (todo.completed) {
					sailsSocket.delete('/todo', todo);
				}
			});
		};

		$scope.markAll = function (allCompleted) {
			angular.forEach($scope.todos, function (todo) {
				todo.completed = !allCompleted;
				sailsSocket.put('/todo', todo);
			});
		};

		$scope.editTodo = function (todo) {
			$scope.editedTodo = todo;
			$scope.originalTodo = angular.extend({}, todo);
		};

		$scope.doneEditing = function (todo) {
			$scope.editedTodo = null;
			if (todo.title) {
				sailsSocket.put('/todo', todo);
			} else {
				sailsSocket.delete('/todo', todo);
			}
		};

		$scope.revertEditing = function (todo) {
			var index = findIndex(todo, $scope.todos);
			angular.extend($scope.todos[index], $scope.originalTodo);
			$scope.editedTodo = null;
		};

		// ------------------ //

		$scope.$on('sailsSocket:connect', function (ev, data) { //(event, data) {
			$log.debug('connected :: ', ev);

			sailsSocket.get('sailsSocket:/todo', {}, function (response) {
				$scope.todos = response;
			});
		});

		$scope.$on('sailsSocket:todo', function (ev, data) {
			var index = null;	
			$log.debug('New socket message received :: ', ev);
			$log.debug('New socket message received :: ', data);

			if (data.model === 'todo') {
				switch (data.verb) {
				case 'create':
					$scope.todos.unshift(data.data);
					break;

				case 'destroy':
					index = findIndex(data, $scope.todos);
					if (index !== null) {
						$scope.todos.splice(index, 1);
					}
					break;

				case 'update':
					index = findIndex(data, $scope.todos);
					if (index !== null) {
						angular.extend($scope.todos[index], data.data);
					}
					break;
				}
			}
		});

	};
}());