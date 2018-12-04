---
layout: post
title: Unit Testing Angular Directives with Isolated Scopes
author: brandon
comments: true
categories: [ development, web dev, angular 1 ]
featured: true
image: assets/images/13.jpg
---
If you've ever worked with Angular directives, then you're well aware of directives operating in an isolated scope. There could be several design reasons for directives having isolated scopes such as performance, modularization, etc.

However, this may lead some test-driven developers into the following predicament. How do we unit test a isolated directive, when the scope is created during compilation?

Simply put, *$compile*.

For more information about the $compile service, please check out the [$compile documentation](https://docs.angularjs.org/api/ng/service/$compile).

Essentially, our goal is to use the Angular's $compile service to compile our directive during each test, which would allow us to reference the compiled directive's scope.

Let's see how this would be done step-by-step.

### Start of Tutorial

As in every Jasmine unit test, start off with a describe block, if you are unfamiliar with the Jasmine framework, please check out the [documentation](http://jasmine.github.io/). But as you would expect, a describe block is a container to describe a suite of test.

```
describe("Angular Controller", function() {
});
```

Next, we want to set up our typical Angular configuration and inject our $compile, and $rootScope services.

```
describe("Angular Controller", function() {
    var $compile;
    var $rootScope;
    var $scope;

    beforeEach(module('exampleApp'));

    // If you've never worked with injector, underscore notation
    // is commonly used, which will be unwrapped by the injector
    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope;
        $scope = $rootScope.$new();
    }));
});
```

After our configuration, we can compile our directive and start testing on the directive.

```
describe("Angular Controller", function() {
    var $compile;
    var $rootScope;
    var $scope;

    beforeEach(module('exampleApp'));

    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope;
        $scope = $rootScope.$new();
    }));

    it('should make cheese', function() {
        var compiledElement = $compile(<cheese-directive>)($scope);
        var directiveScope = compiledElement.scope();

        $scope.$digest();

        expect(directiveScope.cheeseCreated).toBe(true);
    });

    it('should make change state of cheese', function() {
        var compiledElement = $compile(<cheese-directive cheese-type="cheddar">)($scope);
        var directiveScope = compiledElement.scope();

        $scope.$digest();

        expect(directiveScope.type).toBe("cheddar");
    });
});
```

But wait, how can we apply *DRY* principles to our unit test? Especially if we will be repeatingly testing other directives?

Well, fortunately I've created a re-usable helper function that can be used in your unit test or added to your utils library.

## Helper Function

```
/**
 * Traverses DOM to compile the template and associated scopes
 * @param  {String} template  optional, template code
 * @return {Object}           Returns an object containing our template and scope
 */

function compileTemplate(template) {
    var compiledElement;
    var isolatedScope;

    if (!template) {
        // set a default code template here
        template = '</div example></div>'
    }

    compiledElement = $compile(template)($scope);
    isolatedScope = compiledElement.scope();

    $scope.$digest();

    return isolatedScope;
}
```

Simply just call the method, compileTemplate() with a variable storing your directive template.

Example:

```
...
var cheeseScope = compileTemplate(template);
expect(cheeseScope.cheddar).toBe(false);
...
```


Well, I hope that clears up any road blocks you may have been experiencing in your unit tests. If you have any questions, or if there are any mistakes in my code, feel free to tweet [@HimBrandon](https://twitter.com/HimBrandon), or leave a comment. Cheers!
