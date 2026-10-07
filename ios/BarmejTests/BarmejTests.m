#import <UIKit/UIKit.h>
#import <XCTest/XCTest.h>
#import "../Barmej/AppDelegate.h"

@interface BarmejTests : XCTestCase
@end

@implementation BarmejTests
- (void)testNativeApplicationWindowIsReady
{
  AppDelegate *delegate = (AppDelegate *)UIApplication.sharedApplication.delegate;
  XCTAssertTrue([delegate isKindOfClass:AppDelegate.class]);
  XCTAssertNotNil(delegate.window);
  XCTAssertNotNil(delegate.window.rootViewController);
  XCTAssertNotNil(delegate.window.rootViewController.view);
  XCTAssertFalse(delegate.window.hidden);
}

- (void)testRequiredPermissionsAndShareSchemeAreConfigured
{
  NSDictionary *info = NSBundle.mainBundle.infoDictionary;
  XCTAssertGreaterThan([info[@"NSLocationWhenInUseUsageDescription"] length], 0);
  XCTAssertGreaterThan([info[@"NSPhotoLibraryUsageDescription"] length], 0);
  NSArray *urlTypes = info[@"CFBundleURLTypes"];
  XCTAssertTrue([urlTypes.firstObject[@"CFBundleURLSchemes"] containsObject:@"barmejApp"]);
  XCTAssertTrue([info[@"UIBackgroundModes"] containsObject:@"remote-notification"]);
  XCTAssertNotNil([NSBundle.mainBundle URLForResource:@"PrivacyInfo" withExtension:@"xcprivacy"]);
}
@end
