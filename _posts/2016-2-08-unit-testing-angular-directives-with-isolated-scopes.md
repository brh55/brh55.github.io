---
layout: post
title: Unit Testing Angular Directives with Isolated Scopes
comments: true
---
# Isolated Scopes
If you've ever worked with Angular directives, then you're well aware of occassional directives operating in an isolated scope. There could be several reasons for this: performance, modularization, seperation, etc.

But how do we unit test this directive alone, when the scope gets created during compilation?

*one word, $compile*

The goal is to use the Angular $compile service to compile our directive and creating a reference to the compiled isolated scope. Let's see how this would be done step-by-step.

1. Start it off with a describe block

```
describe("Angular Controller", function() {
});
```

2. Set up our configuration and inject our $compile, and $scope service

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

3. Now we can compile our directive and start testing freely.

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

Hopefully this example helps clear up some confusion.

But what if your template code is significantly long?

Well, create a helper function. Here is a re-usable helper function that can be used in your unit test.

## Helper Function

```
/**
 * Traverses DOM to compile the template and associated scopes
 * @param  {String} template  optional, template code
 * @return {Object}           Returns an object containing our template and scope
 */

compileTemplate(template) {
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

Now to utilize this, just call the method compileTemplate() with a variable storing your directive template.


```
...
var cheeseScope = compileTemplate(template);
expect(cheeseScope.cheddar).toBe(false);
...
```

